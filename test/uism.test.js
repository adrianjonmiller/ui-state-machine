import UiStateMachine from '../src';


test('getCurrentState', () => {
  let states = {
    'start': {}
  }

  let uiStateMachine = new UiStateMachine(states, 'start')
  expect(uiStateMachine.getState()).toBe('start');
});


test('getNextState', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      }
    },
    'nextState': {}
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.emit('SUCCESS');
  expect(uiStateMachine.getState()).toBe('nextState');
});

test('leavingState', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
      leave: () => {
        done()
      }
    },
    'nextState': {}
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.emit('SUCCESS');
});


test('enteringState', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      enter: () => {
        done()
      }
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.emit('SUCCESS');
});


test('getPayload', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.emit('SUCCESS');
  expect(uiStateMachine.getPayload()).toBe('success')
});

test('onStateChange', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start');
  uiStateMachine.onStateChange(() => done())
  uiStateMachine.emit('SUCCESS');
});


test('prevState', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start');
  uiStateMachine.emit('SUCCESS');
  uiStateMachine.goToPrevState();
  expect(uiStateMachine.getState()).toBe('start');
});

test('stateGuard', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start');
  uiStateMachine.beforeEach((to, from, next) => {
    if (to === 'nextState' && from === 'start') {
      next()
    }
  });
  uiStateMachine.emit('SUCCESS');
  expect(uiStateMachine.getState()).toBe('nextState');
});