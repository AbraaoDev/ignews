import { query as q} from 'faunadb'

import NextAuth from "next-auth"
import { session } from 'next-auth/client'

import Providers from "next-auth/providers"

import { fauna } from '../../../services/fauna'

export default NextAuth({

  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user',
    }),
  ],

  callbacks: {
    async session(session){
      try{
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )
  
        return {
          ...session, 
          activeSubscription: userActiveSubscription,
        }
      
      }catch{
        return {
          ...session,
          activeSubscription: null,
      }
      
    }
  },
    async signIn(user, account, profile) {
      const { email } = user;
      try {
        await fauna.query(
          //Verificar se o usuário não vai duplicar no FaunaDB
          q.If(
            q.Not(q.Exists(q.Match(q.Index('user_by_email'), q.Casefold(email)))),
            q.Create(q.Collection('users'), { data: { email: email } }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(email)))
          )
        );

        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  }
})