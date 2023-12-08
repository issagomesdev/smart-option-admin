// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import BlankLayout from "src/@core/layouts/BlankLayout"
import ThemeComponent from 'src/@core/theme/ThemeComponent'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Authentication Provider
import { AuthProvider, useAuth } from "src/providers/AuthContext"

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import '../../styles/globals.css'
import { PuffLoader } from 'react-spinners';
import DefaultPalette from "src/@core/theme/palette";
import Box from '@mui/material/Box'

import LoginPage from "src/layouts/components/pages/login"
// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const Layout = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated === null) {
      return <BlankLayout>
        <Box className='content-center'>
          <PuffLoader
            size={100}
            color={DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient}
            cssOverride={{
              display: "block",
              margin: "1",
              borderColor: DefaultPalette(themeConfig.mode, 'primary').customColors.primaryGradient,
            }}
            speedMultiplier={0.8}
          />
        </Box>
      </BlankLayout>
    }

    return isAuthenticated? 
    <UserLayout>
      <Component {...pageProps} />
    </UserLayout> :  
    <BlankLayout>
      <LoginPage/>
    </BlankLayout>
  }
  

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{themeConfig.templateName}</title>
        <meta
          name='description'
          content={themeConfig.templateName}
        />
        <meta name='keywords' content={themeConfig.templateName} />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <SettingsProvider>
        <SettingsConsumer>
          {({ settings }) => {
            return <ThemeComponent settings={settings}>{
              <AuthProvider>
                <Layout/>
              </AuthProvider>
            }</ThemeComponent>
          }}
        </SettingsConsumer>
      </SettingsProvider>
    </CacheProvider>
  )
}

export default App
