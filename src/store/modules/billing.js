import {
  SET_CREDITS,
  SET_DEBITS,
  SET_DEFAULT_PAYMENT_METHOD,
  SET_BILLING_DATE,
  SET_DEFAULT_PP_ID,
  CLEAR_DEFAULT_PAYMENT_METHOD,
  MARK_RETRIEVED,
  CLEAR_BILLING
} from '../mutation-types';
// import errors from 'storj-service-error-types';
import { createStripeToken } from '@/vendors/stripe';
import { lStorage } from '@/utils';
import billingClient from '@/api/billing-client';

// TODO: break out processors and payments into submodule of billing
const state = {
  retrieved: false,
  credits: [],
  debits: [],
  defaultPaymentMethod: {},
  defaultPPId: '',
  billingDate: null
};

const mutations = {
  [SET_CREDITS] (state, credits) {
    state.credits = credits;
  },

  [SET_DEBITS] (state, debits) {
    state.debits = debits;
  },

  [SET_DEFAULT_PAYMENT_METHOD] (state, method) {
    state.defaultPaymentMethod = method;
  },

  [CLEAR_DEFAULT_PAYMENT_METHOD] (state) {
    state.defaultPaymentMethod = {};
  },

  [SET_BILLING_DATE] (state, date) {
    state.billingDate = date;
  },

  [SET_DEFAULT_PP_ID] (state, id) {
    state.defaultPPId = id;
  },

  [MARK_RETRIEVED] (state) {
    state.retrieved = true;
  },

  [CLEAR_BILLING] (state) {
    state.retrieved = false;
    state.credits = [];
    state.debits = [];
    state.defaultPaymentMethod = {};
    state.billingDate = null;
    state.defaultPPId = '';
  }
};

const actions = {
  getCredits ({ commit, dispatch }, params = {}) {
    return new Promise((resolve, reject) => {
      params.user = lStorage.retrieve('email');
      return billingClient.request('GET', '/credits', params)
        .then((res) => resolve(commit(SET_CREDITS, res.data)))
        .catch((err) => reject(err));
    });
  },

  getDebits ({ commit, dispatch }, params = {}) {
    return new Promise((resolve, reject) => {
      params.user = lStorage.retrieve('email');
      return billingClient.request('GET', '/debits', params)
        .then((res) => resolve(commit(SET_DEBITS, res.data)))
        .catch((err) => reject(err));
    });
  },

  removeCard ({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        commit(CLEAR_DEFAULT_PAYMENT_METHOD);
        console.log('hai hai hai');
      }, 2000);
    });
  },

  _setPaymentInfo ({ commit }, res) {
    if (res.data) {
      commit(SET_DEFAULT_PAYMENT_METHOD, res.data.defaultPaymentMethod);
      commit(SET_BILLING_DATE, res.data.billingDate);
      commit(SET_DEFAULT_PP_ID, res.data.id);
    } else {
      commit(SET_DEFAULT_PAYMENT_METHOD, {});
      commit(SET_BILLING_DATE, null);
      commit(SET_DEFAULT_PP_ID, '');
    }
  },

  addPaymentMethod ({ commit, dispatch }, opts) {
    return new Promise((resolve, reject) => {
      console.log('hai', opts.processor.name);
      // TODO: Add switch/case for different processor additions
      if (opts.processor.name !== 'stripe') {
        return true;
      } else if (opts.processor.name === 'stripe') {
        createStripeToken(opts.fields).then((token) => {
          billingClient.request('POST', '/pp/add', {
            data: token,
            processor: opts.processor
          })
          .then((res) => resolve(dispatch('_setPaymentInfo', res)))
          .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
      }
    });
  },

  getDefaultPP ({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      billingClient.request('GET', '/pp/default')
        .then((res) => resolve(dispatch('_setPaymentInfo', res)))
        .catch((err) => reject(err));
    });
  }
};

export default {
  state,
  mutations,
  actions
};
