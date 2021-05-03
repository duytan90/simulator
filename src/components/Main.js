import {useContext, useEffect, useState} from 'react'
import addNotification from 'react-push-notification'
import {createUser, createTask} from './Creator'
import _, {indexOf} from 'lodash'
import moment from 'moment'
import {initConfig, computeStatus} from './config'
import ReactJson from 'react-json-view'
import {TimerContext} from '../context/Timer'
import './Main.css'

const Main = () => {
  // Computed at running session
  const [activeUser, setActiveUser] = useState()
  const [taskQueue, setTaskQueue] = useState([])
  const [stats, setStats] = useState({})
  const [runningTask, setRunningTask] = useState([])
  const {clock, clockAction} = useContext(TimerContext)

  // Persistent resources
  const [taskList, setTaskList] = useState({})
  const [doneTaskList, setDoneTaskList] = useState([])
  const [userList, setUserList] = useState([])

  const handleAddTask = (type) => {
    if (activeUser?.id) {
      const newTask = createTask(type)
      const newTaskType = newTask.type

      const prevTasks = taskList[activeUser.id]?.[newTaskType] || []
      const newsTasks = [...prevTasks, newTask]

      return setTaskList({
        ...taskList,
        [activeUser.id]: {
          ...taskList[activeUser.id],
          [newTaskType]: newsTasks,
        },
      })
    }
    addNotification({
      title: 'Warning',
      message: 'No user was selected',
      theme: 'red',
    })
  }

  const handleStartTask = (task) => {
    if (activeUser?.id) {
      const now = moment().valueOf()
      const toDoTask = {...task, startDate: now, starterID: activeUser.id}
      setTaskQueue([...taskQueue, toDoTask])
      clockAction({type: 'set', id: `${task.id}_${now}`, duration: task.duration, startDate: now})
    }
  }

  const processTask = async (task) => {
    const taskPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        clockAction({type: 'stop', id: `${task.id}_${task.startDate}`})

        let doneTask = {
          ...task,
          id: `${task.id}_${moment().valueOf()}`,
          completedDate: moment().valueOf(),
        }

        addNotification({
          title: `Task's completed`,
          message: `${task.id}`,
          theme: 'light',
          native: true,
          duration: 5000,
          backgroundBottom: ['rgb(218, 218, 218)', 'rgb(179, 214, 255)', 'rgb(215, 205, 255)'][indexOf(initConfig.type, task.type)],
        })

        return resolve(doneTask)
      }, task.duration)
    })

    setRunningTask([...runningTask, taskPromise])
  }

  const handleRemoveTask = (task) => {
    setTaskList({
      ...taskList,
      [activeUser.id]: {
        ...taskList[activeUser.id],
        [task.type]: taskList[activeUser.id][task.type].filter((t) => t.id !== task.id),
      },
    })
  }

  useEffect(() => {
    setUserList(_.times(initConfig.totalUser, () => createUser()))
  }, [])

  useEffect(() => {
    Promise.all(runningTask).then((taskResult) => {
      setDoneTaskList(taskResult)
    })
  }, [runningTask])

  useEffect(() => {
    setStats(computeStatus(doneTaskList, activeUser))
  }, [activeUser, doneTaskList])

  useEffect(() => {
    if (taskQueue.length) {
      taskQueue.forEach((task) => processTask(task))
      const remainingTask = taskQueue.filter((t) => !t.startDate)
      setTaskQueue(remainingTask)
    }
  }, [taskQueue])

  const renderTaskList = (type, i) => {
    const list = taskList?.[activeUser?.id]?.[type] || []

    return (
      <div key={i} className='section'>
        <p className='title'>
          {type} task <button onClick={() => handleAddTask(type)}>Add</button>
        </p>
        {list.map((task, idx) => {
          return (
            <div className='item' key={idx}>
              <p>{task.name}</p>
              <div>
                <button onClick={() => handleStartTask(task)}>Start Task</button>
                <button onClick={() => handleRemoveTask(task)}>Remove Task</button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderDoneList = (type, i) => {
    const list = doneTaskList.filter((task) => task.starterID === activeUser.id && task.type === type)
    return (
      <div key={i} className='section'>
        <p className='title'>{type} task</p>
        {list.map((task, idx) => {
          return <p>{task.name}</p>
        })}
      </div>
    )
  }

  return (
    <>
      <div className='page'>
        <div className='boxed'>
          <span className='sticky'>
            <p>User List</p>
          </span>
          {userList.map((user, idx) => (
            <p className={user.id === activeUser?.id ? 'item active' : 'item'} key={idx} onClick={() => setActiveUser(user)}>
              {user?.name}
            </p>
          ))}
        </div>

        <div className='boxed'>
          <span className='sticky'>
            <p>Task List</p>
          </span>
          {initConfig.type.map((t, idx) => renderTaskList(t, idx))}
        </div>

        <div className='boxed'>
          <span className='sticky'>
            <p>Done List</p>
            <button onClick={() => setDoneTaskList([])}>Clear</button>
          </span>
          {initConfig.type.map((t, idx) => renderDoneList(t, idx))}
        </div>
      </div>

      <p>DEBUG WINDOWS</p>
      <div className='debug'>
        <div className='item'>
          <p>Selecting User Stats</p>
          <ReactJson src={stats} theme='flat' />
        </div>
        <div className='item'>
          <p>Timer Stats</p>
          <ReactJson src={clock} theme='flat' />
        </div>
      </div>
    </>
  )
}

export default Main
