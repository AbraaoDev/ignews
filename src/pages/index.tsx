import { GetStaticProps } from 'next'

import Head from 'next/head'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'
import styles from './home.module.scss'


interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return ( 
    <>
      <Head>
          
          <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>🚀 Falaaaa, dev's</span>
          <h1>Notícias de dev's <span>React</span> World.</h1>
          <p>
            Aproveite e fique por dentro de tudo<br/>
            <span>por {product.amount}/month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>

        </section>
        <img src="/images/avatar.svg" alt="Girl Codding" />
      </main>


    </>
  )
}


export const getStaticProps: GetStaticProps =  async () => {
  const price = await stripe.prices.retrieve('price_1JudY7Atx7a0LnzbarbC7qKb')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'

    }).format(price.unit_amount / 100) ,
  }
  
  return{
    props: {
      product
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }

}