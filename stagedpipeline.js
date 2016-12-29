'use strict';

const async = require('async');

/** Helper Class for implementing Express-Like Pipelines.
  * The Difference is that this Pipeline is a bit more advanced,
  * you can create Stages which will be executed one after the other
  * in a fixed chronological order. You can add functions to those Stages
  * which will be executed with a set of arguments you can define in
  * Pipeline.args and a function as last argument. To exectue the next Stage
  * all functions or current stage have to execute this functions. This
  * function is like the next() function known from exrpess. All Functions
  * asigned to a stage will be executed in parallel. To have a function
  * which has to be executed before another, asign them to two different stages.
  */
class Pipeline {
  /**
   * Create a new Pipeline. Currently now parameters. Will change in the future.
   */
  constructor () {
    this.stagePipelines = [];
    this.stageNames = [];
    this.args = [];
  }

  /**
   * Test if we have a stage.
   * @param {string} stage - Name of the Stage.
   * @returns {boolean} True if we have the stage, false if not
   */
  hasStage (stage) {
    return this.stageNames.indexOf(stage) !== -1;
  }

  /**
   * Returns how many stages we have defined in this Pipeline.
   * @returns {integer} Size of stages
   */
  stageSize () {
    return this.stageNames.length;
  }

  /**
   * Create a new Stage. Will be posiitioned at the end.
   * @param {string} stage - Name of the Stage
   * @returns {integer} Index of the new created Stage
   */
  createStage (stage) {
    // Do we already have this stage?
    let stagePos = this.stageNames.indexOf(stage);
    if (stagePos !== -1) {
      return stagePos;
    }
    stagePos = this.stagePipelines.push([]) - 1;
    this.stageNames.push(stage);
    return stagePos;
  }

  /**
   * Create a new Stage positioned after another known Stage
   * @param {string} after - Name of stage after which the new Stage
   *                         should be positioned
   * @param {string} stage - Name of new Stage
   * @returns {integer} Index of the new created Stage
   */
  createStageAfter (after, stage) {
    let stagePos = this.stageNames.indexOf(stage);
    const afterPos = this.stageNames.indexOf(after);

    // Check if after stage is defined
    if (afterPos === -1) {
      // if not, append both stages. Maybe weird behaviour?
      // Should throw error or so.
      this.createStage(after);
      return this.createStage(stage);
    }

    if (stagePos !== -1) {
      // If stage is already defined, just return pos
      return this.stageNames[stage];
    }

    if (afterPos === this.stageNames.length - 1) {
      // after is last stage so we can just append
      return this.createStage(stage);
    }

    // increase all positision of stages after after by one
    this.stageNames.splice(afterPos + 1, 0, stage);

    stagePos = afterPos + 1;
    // now insert empty array at pos afterPos+1 in this.spipelines
    this.stagePipelines.splice(stagePos, 0, []);
    return stagePos;
  }

  /**
   * Create a new Stage which is positioned in front of another already
   * known Stage
   * @param {string} before - Name of Stage on which we want to create a stage
   *                          in front of
   * @param {string} stage  - Name of new Stage we want to create
   * @returns {integer} Index of the new created Stage
   */
  createStageBefore (before, stage) {
    const beforePos = this.stageNames.indexOf(before);
    var stagePos = this.stageNames.indexOf(stage);

    if (stagePos !== -1) {
      return stagePos;
    }

    if (beforePos === -1) {
      stagePos = this.createStage(stage);
      this.createStage(before);
    }

    // increase all positions >= beforePos
    this.stageNames.splice(beforePos, 0, stage);

    stagePos = beforePos;

    // now insert empty array at pos afterPos+1 in this.spipelines
    this.stagePipelines.splice(stagePos, 0, []);
    return stagePos;
  }

  /**
   * Remove a stage and all asigned functions
   * @param {string} stage - Name of Stage which should get removed
   * @returns {boolean} True if could remove , false if not
   */
  removeStage (stage) {
    const stagePos = this.stageNames.indexOf(stage);
    if (stagePos === -1) {
      return false;
    }
    this.stagePipelines.pop(stagePos);
    this.stageNames.pop(stagePos);
    return true;
  }
  /**
   * Every pipelineStageFunction gets a callback function passed as last
   * Argument, which needs to get called when the stageFunction exits.
   * Otherwise we won't get into the next stage.
   * You have to call this function, even if you encounter an error.
   * If you have to stop for some reasons, modifiy the execute function
   * of this class to fit your needs or implement a check in every
   * stageFunction if the function has to do something or should just pass or
   * just call pipelineNextCallback() function with an error as first argument.
   *
   * @callback pipelineNextCallback
   * @param {error} [err] - If you want to stop execution, pass an error as
   *                        first Argument. Other Stages will get skipped an
   *                        you can cath this error with
   *                        pipeline.execute(function done(err)...)
   */

  /**
   * Functions which you asign to a stage need to accept arguments in this
   * scheme.
   * @callback pipelineStageFunction
   * @param {...*} argN - All elements in pipeline.args. Or nothing if empty.
   * @callback {pipelineNextCallback}
   */

  /**
   * Asign a Pipeline Function to a Stage.
   * @param {string} [stage] - Name of Stage to which this function gets
   *                           assigned. If not passed, a new Stage will
   *                           be created.
   * @param {string} [name]  - Name of function. If not passed, we try
   *                           to get the function name. If function is
   *                           anonymous, name will be ''.
   * @param {pipelineStageFunction} fn - The function which should get
   *                                     get asigned to state. This function
   *                                     needs as arguments all elements of
   *                                     pipeline.args and a next function arg.
   * @returns {void}
   */
  use (stage, name, fn) {
    if (typeof stage === 'function') {
      fn = stage;
      stage = null;
      name = null;
    }

    if (typeof name === 'function') {
      fn = name;
      name = null;
    }

    if (stage === null) {
      // If stage is not set (eq null) we wan't to create a new
      // undefined stage. We just name em from 0 to infinite by the length
      // of pipelines

      // ToDO: Check if there is already a stage called current pipelines.length
      stage = this.stagePipelines.length;
    }

    if (name === null) {
      name = fn.name;
    }

    // Find stage index
    let stagePos = this.stageNames.indexOf(stage);
    if (stagePos === -1) {
      stagePos = this.createStage(stage);
    }
    this.stagePipelines[stagePos].push([name, fn]);
  }

  /**
   * More or less internal function to remove specific functions from pipeline.
   * @param {object} options - Options object
   * @param {function} options.fn - Remove functions which are the same (===)
   *                                as fn
   * @param {string} [options.stageName=null] - Remove functions only from a
   *                                            specific stage. Set to null if
   *                                            you want to search through all
   *                                            stages.
   * @param {integer} [options.limit=1] - Remove only limit functions. By
   *                                      default only 1 (the first matching).
   *                                      Set to -1 if you want to remove all
   *                                      matching functions.
   * @returns {integer} how many functions we removed
   */
  _removeFunctionFromPipeline (options) {
    let limit = options.limit || 1;
    if (!options.stageName) options.stageName = null;
    if (!options.fnName) options.fnName = null;
    if (!options.fnFunc) options.fnFunc = null;

    let purged = 0;
    let stageIt = this.stageIterator();
    for (let [stagePos, stageName, pipe] of stageIt) {
      if (limit === 0) break; // if limit is zero, break

      // Make sure this is stage we want to search through
      if (options.stageName === null || options.stageName === stageName) {
        for (let pipePos = 0; pipePos < pipe.length; pipePos++) {
          let fnName = pipe[pipePos][0];
          let fnFunc = pipe[pipePos][1];
          if (options.fnName === null || options.fnName === fnName) {
            if (options.fnFunc === null || options.fnFunc === fnFunc) {
              if (this.stagePipelines[stagePos].pop(pipePos)) {
                purged++;
                pipePos--;
                limit--;
              }
            }
          }

        }
      }
    }
    return purged;
  }

  /**
   * Generator to iterate over stages
   * @yields {array} yield
   * @yields[0] {integer} stagePos
   * @yields[1] {string} stageName
   * @yields[2] {array} pipeline[stagePos]
   * @returns {generator} ouuh jsdoc...
   */
  * stageIterator () {
    for (let stagePos = 0; stagePos < this.stageNames.length;
         stagePos++) {
      // yup, this is slow. But otherwise we would need to make
      // this.stageNames an array.
      let stageName = this.stageNames[stagePos];
      yield [stagePos, stageName, this.stagePipelines[stagePos]];
    }
  }

  /**
   * @param {string} stage - as
   * @param {string} name - as
   * @param {function} fn -as
   * @returns {integer} deleted
   */
  unuse (stage, name, fn) {
    if (typeof name === 'function') {
      fn = name;
      name = null;
    }
    if (typeof stage === 'function') {
      fn = stage;
      stage = null;
      name = null;
    }
    if (stage === null) {
      // if stage is null,
    }
    return this._removeFunctionFromPipeline(
        {fnFunc: fn, fnName: name, limit: 1}
      ) === 1;
  }

  /**
   * Callback which will be executed after all stages have been processed
   * or one pipelineStageFunction called pipelineNextCallback with an Error
   * argument.
   * @callback {pipelineExecuteDoneCallback}
   * @param {err} [err=null] - Error or null
   */

  /**
   * Execute pipeline. Executes every function in stage parallel and passes
   * each element of pipeline.args as seperate argument to pipelineStageFunction
   * and pipelineNextCallback as last argument. Executes every stage in series
   * and waits for all stageFunctions to be finished. After that next stage will
   * get processed.
   * @param {pipelineExecuteDoneCallback} done - Gets executed when execution if
   *                                             finished.
   * @returns {void}
   */
  execute (done) {
    var self = this;

    // Each stage will be executed in series
    async.eachSeries(this.stagePipelines, function (stage, next1) {
      // Each function in stage will be executed in parallel
      async.each(stage, function (nameFunctionArray, next2) {
        // let name = nameFunctionArray[0];
        let fn = nameFunctionArray[1];
        return fn.apply(self, self.args.concat(next2));
      }, next1);
    }, function (err) {
      if (typeof done === 'function') {
        return done(err);
      }
    });
  }
}

module.exports = Pipeline;
