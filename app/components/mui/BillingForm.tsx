import { Button, TextField } from '@mui/material'
import React from 'react'

const BillingForm = ({ billing_data, set_billing_data, get_client_secret, loading, set_loading }: any) => {
    return (
        <form
            onSubmit={get_client_secret}
            className='w-full h-fit flex flex-col justify-start items-start gap-4'>
            <TextField
                label="Address"
                value={billing_data?.address || ""}
                onChange={(e: any) => set_billing_data((prev: any) => ({ ...prev, address: e?.target?.value }))}
                fullWidth
                sx={{ width: "100%" }}
            />

            <TextField
                label="Country"
                value={billing_data?.country || ""}
                onChange={(e: any) => set_billing_data((prev: any) => ({ ...prev, country: e?.target?.value }))}
                fullWidth
                sx={{ width: "100%" }}
            />

            <TextField
                label="State"
                value={billing_data?.state || ""}
                onChange={(e: any) => set_billing_data((prev: any) => ({ ...prev, state: e?.target?.value }))}
                fullWidth
                sx={{ width: "100%" }}
            />

            <TextField
                label="City"
                value={billing_data?.city || ""}
                onChange={(e: any) => set_billing_data((prev: any) => ({ ...prev, city: e?.target?.value }))}
                fullWidth
                sx={{ width: "100%" }}
            />

            <TextField
                label="Postal Code"
                value={billing_data?.postal_code || ""}
                onChange={(e: any) => set_billing_data((prev: any) => ({ ...prev, postal_code: e?.target?.value }))}
                fullWidth
                sx={{ width: "100%" }}
            />

            <Button
                type='submit'
                fullWidth
                disabled={loading}
                color="secondary"
                variant='contained'
            >Proceed to payment</Button>
        </form>
    )
}

export default BillingForm
