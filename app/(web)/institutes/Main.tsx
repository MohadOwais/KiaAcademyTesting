"use client"

import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import InstituteBanner from "./components/InstituteBanner"
import PopularInstitutes from "./components/PopularInstitutes"
import PopularUniversities from "./components/PopularUniversities"
import PopularColleges from "./components/PopularColleges"
import PopularCompanies from "./components/PopularCompanies"

import { useSelector } from "react-redux"

const Institutes = () => {
    const isLogin = useSelector((state: any) => state?.isLogin)

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main className="p-3">
                <InstituteBanner />
                {/* Show all four types for all users */}
                {/* <PopularInstitutes />
                <PopularUniversities />
                <PopularColleges />
                <PopularCompanies /> */}
            </main>
            <Footer />
        </div>
    )
}

export default Institutes