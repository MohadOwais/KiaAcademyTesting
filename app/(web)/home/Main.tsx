"use client"

import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import Section1 from "./components/Section1"
import Section4 from "./components/Section4"
import Section5 from "./components/Section5"
import Section6 from "./components/Section6"
import Section7 from "./components/Section7"
import { useSelector } from "react-redux"
import PopularCourses from "./components/PopularCourses"
// import LatestCourses from "./components/LatestCourses"

const Home = () => {
    const isLogin = useSelector((state: any) => state?.isLogin)

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main>
                <Section1 />
                {isLogin ? (
                    <>
                        <PopularCourses />
                        <Section5 />
                        <Section7 /> 
                        {/* <LatestCourses /> */}
                        <Section6 />
                        <Section4 />
                    </>
                ) : (
                    <>
                        <PopularCourses />
                        <Section5 />
                        {/* <LatestCourses /> */}
                        <Section6 />
                        <Section4 />
                        <Section7 />
                    </>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default Home