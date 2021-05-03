import moment from 'moment'
import _ from 'lodash'

export const initConfig = {
  totalUser: 3, // Total random user
  type: ['exp', 'pomo', 'any'], // Define available type for task
}

let runCondition = {
  timeUnit: 'minutes', // Calculate time (e.g. all tasks were done within minutes, days, weeks, etc.)
}

// Extra business requirements 
initConfig.type.forEach((t) => {
  runCondition[t] = {
    minAttempt: {
      0: 1,
      1: 1,
      default: 3,
    },
  }
})

// console.log({runCondition})

const completedTaskTimeDiff = (task) => {
  return moment().diff(task.completedDate, runCondition.timeUnit)
}

export const computeStatus = (doneTaskList, user) => {
  const allTime = doneTaskList.filter((task) => task.starterID === user.id)
  const lastMinDone = doneTaskList.filter((task) => task.starterID === user.id).filter((task) => completedTaskTimeDiff(task) < 1)
  const lastCompletedTask = _.last(
    _.sortBy(
      doneTaskList.filter((task) => task.starterID === user.id),
      (task) => task.completedDate
    )
  )

  return {
    [user?.name]: {
      allTimeDone: allTime,
      lastMinDone,
      lastCompletedTask: {
        ...lastCompletedTask,
        since: moment(lastCompletedTask?.completedDate).fromNow(),
      },
    },
  }
}

export const condition = runCondition
