/* import Main from './pages/Main' */
import './App.css'
import { ProductsProvider } from './contexts/ProductsProvider'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import LoginForm from './features/auth/components/LoginForm'

function App() {
   return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <ProductsProvider>
            <LoginForm />
            {/*  <Main /> */}
            <Toaster position="bottom-left" />
         </ProductsProvider>
      </ThemeProvider>
   )
}

export default App
