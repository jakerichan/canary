import { CanaryProvider, useGlobalCanary } from '@canary-flags/react'
import Feature from './Feature'

const canaryConfig = [
  {
    name: 'param-test',
    value: false,
    metadata: {
      description: 'Lorem ipsum dolor sit amet',
      source: 'app.tsx',
    },
  },
  {
    value: true,
    name: 'test',
    metadata: {
      description: 'Consectetur adipiscing elit',
      source: 'app.tsx',
    },
  }, {
    value: 'option-1',
    name: 'string-list',
    variants: [
      'option-1',
      'option-2',
      'option-3',
    ],
    metadata: {
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      source: 'app.tsx',
    },
  }]

export function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
      <CanaryProvider
        onEvaluateFlag={(key, value, config) => {
          console.log('evaluated flag', key, value, config)
        }}
        canaryConfig={canaryConfig}
      >
        <GlobalCanary />
        <div>Canary React App</div>
        <Feature />
      </CanaryProvider>
    </div>
  )
}

const GlobalCanary = () => {
  useGlobalCanary('canary')
  return null
}

export default App
