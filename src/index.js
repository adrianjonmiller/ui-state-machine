export default class {
  constructor (states, currentState = null) {
      this.states = states;
      this.currentState = currentState;
      this.prevStates = [];
      this.payload = null
      this.events = [];
      this.cb = null;

      if (currentState) {
          this.updateState(currentState)
      }

      return {
          on: this.on.bind(this),
          onStateChange: this.onStateChange.bind(this),
          getState: this.getState.bind(this),
          getPrevState: this.getPrevState.bind(this),
          getPayload: this.getPayload.bind(this)
      }
  }

  on (event) {
      try {
          
          let {next} = this.states[this.currentState].on[event.toUpperCase()];
          
          if (next) {
              if (next !== this.currentState) {
                  this.updateState(next);
                  this.events.push(event);
              }
          }  else {
              throw `${event} does not exist in ${this.currentState}`
          }
      } catch (err) {
          console.error(err)
      }
      
      
  }

  onStateChange (cb) {
      this.cb = cb
  }

  getState () {
      return this.currentState
  }

  getPayload () {
      return this.payload
  }

  getPrevState () {
      return this.prevStates.length > 0 ? this.prevStates[this.prevStates.length - 1] : null;
  }

  updateState (next) {
      let payload = this.states[next].payload;

      if (this.currentState) {
          let currentStateOb = this.states[this.currentState];

          if ('leave' in currentStateOb) {
              if (typeof currentStateOb.leave === 'function') {
                  currentStateOb.leave(next, this.currentState)
              }
          }

          this.prevStates.push(this.currentState);
      }

      this.currentState = next;

      if (payload) {
          this.payload = payload
      }

      let newStateOb = this.states[this.currentState];

      if ('enter' in newStateOb) {
          if (typeof newStateOb.enter === 'function') {
              newStateOb.enter(this.currentState, this.prevStates)
          }
      }

      if (typeof this.cb === 'function') {
          this.cb(this.currentState, this.prevStates, payload);
      }
  }
}