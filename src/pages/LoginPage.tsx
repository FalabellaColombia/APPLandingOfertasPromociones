import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '@/features/auth/components/LoginForm'
import supabase from '@/utils/supabase'

function LoginPage() {
   const navigate = useNavigate()

   useEffect(() => {
      const checkSession = async () => {
         const { data } = await supabase.auth.getSession()
         if (data.session) {
            navigate('/dashboard', { replace: true })
         }
      }

      checkSession()
   }, [navigate])

   return <LoginForm />
}

export default LoginPage
