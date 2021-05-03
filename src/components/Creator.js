import {v4 as uuidv4} from 'uuid'
import moment from 'moment'
import Jabber from 'jabber'
import _ from 'lodash'

const jabber = new Jabber();

// Entity creator

export const createUser = (name = null) => {
  return {
    id: `user-${uuidv4()}`,
    name: jabber.createFullName(),
    createDate: moment().valueOf(),
  }
}

export const createTask = (type) => {
  return {
    id: `${type}-${uuidv4()}`,
    name: jabber.createWord(6),
    createDate: moment().valueOf(),
    duration: _.random(2000, 3000), // Simulate task duration in millisecond
    type
  }
}