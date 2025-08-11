"use client"

import axios from 'axios'
import React, { useEffect, useState, useCallback } from 'react'
import { authorizationObj } from '@/app/utils/core'
import { CircularProgress } from '@mui/material'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { CompanyAvatar } from '@/app/(auth)/auth/signin/Main'

const Main = ({ token }: any) => {
  const router = useRouter()

  const [is_success, set_is_success] = useState(true)
  const [is_loading, set_is_loading] = useState(false)
  const [message, set_message] = useState("")

  const verify_email = async () => {
    try {
      set_is_loading(true)
      const resp = await axios.get(`https://api.kiacademy.in/verify-email/${token}`, authorizationObj)
      set_is_loading(false)
      if (resp?.data?.status > 199 || resp?.data?.status < 300) {
        set_is_success(true)
        set_message("Email verified successfully, proceed to login")
      } else {
        set_is_success(false)
        set_message(resp?.data?.message)
      }
    } catch (error) {
      set_is_success(false)
      set_is_loading(false)
      set_message("Oops something went wrong")
    }
  }

  // Memoize the router push to avoid passing the whole router object as a dependency
  const navigateToLogin = useCallback(() => {
    router.push("/auth/signin")
  }, [router])

  useEffect(() => {
    verify_email()
    const redirectTimeout = setTimeout(() => {
      navigateToLogin() // Use the memoized function
    }, 6000) // Redirect after 10 seconds

    // Clean up the timeout when the component unmounts
    return () => clearTimeout(redirectTimeout)
  }, [token, navigateToLogin]) // Only pass `token` and `navigateToLogin`

  return (
    <div className='container d-flex flex-column justify-content-center align-items-center vh-100 p-4 gap-4'>
      {
        is_loading ? <CircularProgress size={32} color="primary" /> :
          <>
            <CompanyAvatar />
            <p className={`w-100 text-center ${is_success ? "text-success" : "text-danger fw-bold"} fs-4`}>{message}</p>
            {
              is_success ?
                <Button
                  className='btn-view rounded-pill'
                  variant="contained"
                  style={{ fontSize: "1em", width: "250px", marginTop: "0.5em" }}
                  onClick={navigateToLogin}
                >
                  Proceed to login
                </Button>
                : null
            }
          </>
      }
    </div>
  )
}

export default Main
