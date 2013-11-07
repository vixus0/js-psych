var clicktype = 'click';
if (document.ontouchstart) clicktype = 'touchstart';

////
// Utils
//

function getId(id) {
  return document.getElementById(id);
}

function randInt(a, b) {
  return Math.floor((b-a+1) * Math.random() + a);
}

function randInts(n, a, b, init) {
  var list = [init];
  for (var i=0; i<n; i++) {
    var num = randInt(a,b);
    while (num == list[list.length - 1] || num == list[0]) {
      num = randInt(a,b);
    }
    list.push(num);
  }
  return list;
}

function Results(cols) {
  this.cols = cols;
  this.list = [];

  this.addResult = function(result) {
    if (result.length == this.cols.length) {
      var res = new Object();
      for (var i=0; i<this.cols.length; i++) {
        res[this.cols[i]] = result[i];
      }
      this.list.push(res);
    }
  };

  this.renderHTML = function() {
    var len = this.list.length;
    var nc = this.cols.length;

    out = "<table><thead><tr><td>#</td>";
    for (var i=0; i<nc; i++) {
      out += "<td>"+cols[i]+"</td>";
    }
    out += "</tr></thead><tbody>";
    for (var i=0; i<len; i++) {
      out += "<tr><td>"+(i+1)+"</td>";
      for (var j in this.list[i]) {
        out += "<td>"+this.list[i][j]+"</td>";
      }
      out += "</tr>";
    }
    out += "</tbody></table>";
    return out;
  };
}

////
// Question Sets
//

function MathQSet(timer, numq) {
  var self = this;

  var nChoices = 4;
  var maxNum = 10;

  this.timer = timer;
  this.numQ = numq;
  this.curQ = 1;

  this.resCols = ['NumA', 'NumB', 'Choices', 'Correct', 'Chose', 'Response'];
  this.results = new Results(this.resCols);
  this.lastres = [];

  this.answerQuestion = function(choice) {
    this.lastres[4] = choice.answer_id + 1;
    this.lastres[5] = (this.timer() - this.lastres[5]).toFixed(2);
    this.results.addResult(this.lastres);
    if (this.curQ < this.numQ) {
      self.nextQuestion();
      this.curQ++;
    } else {
      this.showResults();
    } 
  };

  this.nextQuestion = function() {
    var numA = randInt(1,maxNum);
    var numB = randInt(1,maxNum);
    var answer = numA + numB;

    var correctChoice = randInt(0,nChoices-1);

    var q = this.q_div;
    var a = this.a_div;
    
    q.innerHTML = "Question "+this.curQ+"<br><br>" + numA + " + " + numB + " = ?";
    a.innerHTML = "";

    var choices = [];
    var rlist = randInts(nChoices, 1, maxNum*2, answer);

    for (var i=0; i<nChoices; i++) {
      a.appendChild( document.createElement('span') );
      a.lastElementChild.className = 'button';
      a.lastElementChild.answer_id = i;
      a.lastElementChild.addEventListener(clicktype, function(){self.answerQuestion(this)}, false);;
      if (i === correctChoice) {
        a.lastElementChild.innerHTML = ""+answer;
        choices.push(answer);
      } else {
        var thisChoice = rlist.pop();
        a.lastElementChild.innerHTML = ""+thisChoice;
        choices.push(thisChoice);
      }
    }

    this.lastres = [numA, numB, choices, correctChoice+1, null, this.timer()];
  };

  this.showResults = function() {
    var q = this.q_div;
    var a = this.a_div;
    a.innerHTML = "";
    q.innerHTML = "<p>Test complete.</p><p>";
    q.innerHTML += this.results.renderHTML();
  };

  this.init = function(out_div) {
    this.q_div = document.createElement('div');
    this.a_div = document.createElement('div');
    this.q_div.id = "question";
    this.a_div.id = "answers";
    this.q_div.className = "centxt";
    this.a_div.className = "centxt";

    out_div.appendChild(this.q_div);
    out_div.appendChild(this.a_div);
    out_div.style.display = 'block';

    self.nextQuestion();
  };

}

function PosQSet(timer) {

}


////
// Main
//

function startTest() {
  var numQ = parseInt( getId('numq').value );
  var testType = getId('test_type').value;

  // Timestamping
  if (window.performance.now) {
    getTime = function() { return window.performance.now(); };
  } else{
    if (window.performance.webkitNow) {
      getTime = function() { return window.performance.webkitNow(); };
    } else {
      getTime = function() { return new Date().getTime(); };
    }
  }

  // Init
  var qSet = null;
  switch(testType) {
    case 'math':
      qSet = new MathQSet(getTime, numQ);
      break;
    case 'position':
      qSet = new PosQSet(getTime, numQ);
      break;
  }

  getId('params').style.display = 'none';
  divTest = getId('testbed');

  qSet.init(divTest);
}

getId('start_test').addEventListener(clicktype, startTest, false);
