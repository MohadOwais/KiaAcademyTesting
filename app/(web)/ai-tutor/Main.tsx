"use client"

import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import Section1 from "./components/VideoBanner"
import Section4 from "./components/Section4"
import Section5 from "./components/Section5"
import Section6 from "./components/Section6"
import { useSelector } from "react-redux"
import PopularBoards from "./components/PopularBoards"
import VideoBanner from "./components/VideoBanner"

const AI_tutor = () => {
    const isLogin = useSelector((state: any) => state?.isLogin)

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main>
                <VideoBanner />
                {isLogin ? (
                    <>
                        <PopularBoards />
                        <Section6 />
                        <Section4 />
                    </>
                ) : (
                    <>
                        <PopularBoards />
                        <Section5 />
                        <Section6 />
                        <Section4 />
                    </>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default AI_tutor