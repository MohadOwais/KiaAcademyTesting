"use client"

import { setSubscription } from "@/app/redux/user";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PaymentPlans from "@/app/components/stripe/PaymentPlans";

interface RootState {
  user: {
    institute_id: string
  }
}

export const PayPopup = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const currentUser = useSelector((state: RootState) => state?.user)
  const dispatch = useDispatch()
  const [is_subscription, set_is_subscription] = useState<null | boolean>(null)
  const [show_plans, set_show_plans] = useState(false)

  useEffect(() => { get_subscription() }, [])

  const get_subscription = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/subscriptions/institute/${currentUser?.institute_id}`, authorizationObj)
      if (resp?.data?.data && resp?.data?.data?.length && resp?.data?.data[0]) {
        set_is_subscription(true)
        set_show_plans(false)
        dispatch(setSubscription(resp?.data?.data[0]))
      } else {
        set_is_subscription(false)
        set_show_plans(true)
      }
    } catch (error) {
      // console.error(error)
    }
  }

  const handleClose = () => {
    set_show_plans(false);
  };

  return (
    <>
      {is_subscription === false && (
        <div
          className={`modal fade${show_plans ? ' show' : ''}`}
          style={{ display: show_plans ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Choose a plan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <PaymentPlans
                  set_show_plans={set_show_plans}
                  set_is_subscription={set_is_subscription}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {is_subscription !== false && children}
      {show_plans && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
