import React from 'react'
import Main from './Main'

const Page = ({ params }: any) => <Main token={params?.token} />

export default Page