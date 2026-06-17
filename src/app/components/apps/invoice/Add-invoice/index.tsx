'use client'
import { Card } from "@/components/ui/card";
import React from "react";
import CreateInvoice from '@/app/components/apps/invoice/Add-invoice/create';
import { InvoiceProvider } from '@/app/context/InvoiceContext/index';

function CreateInvoiceApp() {
    return (
        <InvoiceProvider>
            <Card>
                <CreateInvoice />
            </Card>
        </InvoiceProvider>
    )
}
export default CreateInvoiceApp;