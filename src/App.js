import './App.css'
import Main from './components/Main'
import {Notifications} from 'react-push-notification'
import  {Timer} from './context/Timer'

function App() {
  return (
    <>
      <Notifications />
      <div className='App'>
        <Timer>
          <Main />
        </Timer>
      </div>
    </>
  )
}

export default App
