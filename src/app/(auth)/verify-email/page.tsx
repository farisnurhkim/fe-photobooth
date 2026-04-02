import { Suspense } from 'react';
import VerifyClient from './VerifyClient';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="text-center p-10 text-white">Loading Verification Engine...</div>}>
            <VerifyClient />
        </Suspense>
    )
}
