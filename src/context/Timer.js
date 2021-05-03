import React, {useEffect, useReducer} from 'react'
import _ from 'lodash'
import moment from 'moment'

const TimerContext = React.createContext()
const timerRate = 100 // How frequenly does timer update monitor value
let timeInterval = null

const clockReducer = (clock, action) => {
  const {type, id, duration, startDate} = action
  const {monitoring, archived} = clock

  switch (type) {
    case 'set': {
      const newClock = {
        id: id,
        status: 'running',
        elapsedTime: 0,
        duration,
        startDate,
      }
      return {...clock, monitoring: [...monitoring, newClock], running: true}
    }

    case 'stop': {
      let stopClock = _.find(monitoring, (e) => e.id === id && e.status === 'running')
      stopClock = {...stopClock, status: 'stopped'}

      if (stopClock) {
        return {...clock, monitoring: monitoring.filter((e) => e.id !== id), archived: [...archived, stopClock]}
      } else return clock
    }

    case 'pause': {
      let pauseClock = _.find(monitoring, (e) => e.id === id)
      pauseClock = {...pauseClock, status: 'pause'}

      return {...clock, monitoring: _.merge(monitoring, [pauseClock])}
    }

    case 'update': {
      const runningClock = monitoring
        .filter((e) => e.status === 'running')
        .map((e) => {
          return {
            ...e,
            elapsedTime: moment().diff(e.startDate),
          }
        })

      return {...clock, monitoring: _.merge(monitoring, runningClock), running: runningClock.length > 0}
    }

    default: {
      throw new Error(`Unhandled action type: ${type}`)
    }
  }
}

const Timer = ({children}) => {
  const [clock, clockAction] = useReducer(clockReducer, {monitoring: [], archived: [], running: false})

  useEffect(() => {
    if (clock.running) {
      if (!timeInterval) {
        timeInterval = setInterval(() => {
          clockAction({type: 'update'})
        }, timerRate)
      }
    } else {
      clearInterval(timeInterval)
      timeInterval = null
    }
  }, [clock])

  const value = {clock, clockAction}

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export {Timer, TimerContext}
