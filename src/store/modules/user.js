import * as types from '@/store/mutation-types';
import axios from 'axios';
import Promise from 'bluebird';
import config from '../../../config';
import errors from 'storj-service-error-types';

const state = {
  email: ''
};

const mutations = {
  [types.SET_USER] (state, email) {
    console.log('commiting SET_USER', email);
    state.email = email;

    // save user to localStorage
    window.localStorage.setItem('email', email);
  },

  [types.CLEAR_USER] (state) {
    console.log('commiting CLEAR_USER');
    state.email = '';

    window.localStorage.removeItem('email');
  }
};

const actions = {
  /**
   * Creates a new Storj user
   */
  createUser ({ commit, state }, credentials) {
    return new Promise((resolve, reject) => {
      console.log('ACTION: createUser', credentials);
      axios.post(config.app.BRIDGE_URL + '/users', credentials)
        .then((result) => {
          if (result.status < 400) {
            commit(types.SET_USER, credentials.email);
            return resolve();
          }
        })
        .catch((err) => reject(new errors.InternalError(err)));
    });
  }
};

export default {
  state,
  mutations,
  actions
};
