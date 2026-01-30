import { Loader } from '@/components/Loader'
import supabase from '@/utils/supabase'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
   children: React.ReactNode
}

export default function PrivateRoute({ children }: Props) {
   const [isLoading, setIsLoading] = useState(true)
   const [isAuthenticated, setIsAuthenticated] = useState(false)

   useEffect(() => {
      const checkSession = async () => {
         const {
            data: { session },
         } = await supabase.auth.getSession()
         setIsAuthenticated(!!session)
         setIsLoading(false)
      }
      checkSession()
   }, [])

   if (isLoading) return <Loader />

   return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
