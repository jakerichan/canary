import { CanaryProvider, useGlobalCanary, useHashOverride } from '@canary-flags/react'
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

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
      <CanaryProvider
        onEvaluateFlag={(key, config) => {
          console.log('evaluated flag', key, config)
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
  useHashOverride('canary')
  return null
}

export default App
