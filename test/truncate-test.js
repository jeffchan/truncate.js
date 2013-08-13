describe('truncatejs', function () {
  beforeEach(function () {
    var div = this.div = document.createElement('div');
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
  });

  afterEach(function () {
    document.body.removeChild(this.div);
  });

  it('truncate nothing', function () {
    this.div.innerHTML = 'Four lines';
    this.div.style['font-size'] = '12px';
    this.div.style['line-height'] = '12px';

    var truncated = new Truncate(this.div, {
      lines: 4,
      lineHeight: 12
    });

    assert.equal(this.div.clientHeight, 12);
  });

  it('truncate four lines', function () {
    this.div.innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor';
    this.div.style.width = '50px';
    this.div.style['font-size'] = '12px';
    this.div.style['line-height'] = '12px';

    var truncated = new Truncate(this.div, {
      lines: 4,
      lineHeight: 12
    });

    assert.equal(this.div.clientHeight, 48);
  });

  it('truncates through child nodes', function () {
    this.div.innerHTML = 'members, friends, adversaries, competitors, and colleagues--<!--- test --><em>Walter Isaacson</em>';
    this.div.style.width = '234px';
    this.div.style['font-size'] = '14px';
    this.div.style['line-height'] = '20px';

    var truncated = new Truncate(this.div, {
      lines: 2,
      lineHeight: 20,
      showMore: '',
      showLess: ''
    });

    assert.equal(this.div.clientHeight, 40);
    assert.equal(this.div.innerHTML, 'members, friends, adversaries, competitors, and colleagues--<!--- test --><em>Walter</em>');
  });

  it('truncates through manual line breaks', function () {
    this.div.innerHTML = 'members, friends, adversaries,<br/><br/>competitors, and colleagues';
    this.div.style.width = '230px';
    this.div.style['font-size'] = '14px';
    this.div.style['line-height'] = '20px';

    var truncated = new Truncate(this.div, {
      lines: 1,
      lineHeight: 20,
      showMore: '',
      showLess: ''
    });

    assert.equal(this.div.clientHeight, 20);
    assert.equal(this.div.innerHTML, 'members, friends, adversaries,<br>');
  });

  it('truncates properly with nested nodes', function () {
    this.div.innerHTML = '<div>members, friends, adversaries, competitors, and colleagues--<!--- test --><em>Walter Isaacson</em></div>';
    this.div.style.width = '234px';
    this.div.style['font-size'] = '14px';
    this.div.style['line-height'] = '20px';

    var truncated = new Truncate(this.div, {
      lines: 2,
      lineHeight: 20,
      showMore: '',
      showLess: ''
    });

    assert.equal(this.div.clientHeight, 40);
    assert.equal(this.div.innerHTML, '<div>members, friends, adversaries, competitors, and colleagues--<!--- test --><em>Walt… </em></div>');
  });
});
