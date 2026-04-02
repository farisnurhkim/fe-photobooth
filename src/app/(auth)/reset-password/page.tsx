import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center p-10 text-white font-bold">Initializing Recovery...</div>}>
            <ResetPasswordClient />
        </Suspense>
    )
}
