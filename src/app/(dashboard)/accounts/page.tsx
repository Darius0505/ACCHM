import { redirect } from 'next/navigation';

export default function AccountsRedirect() {
    redirect('/accounts/dashboard');
}
