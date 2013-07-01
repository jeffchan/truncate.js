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

  it('truncate two lines, leaving comments and child nodes intact', function () {
    this.div.innerHTML = 'members, friends, adversaries, competitors, and colleagues--<!--- test --><em>Walter Isaacson</em>';
    this.div.style.width = '230px';
    this.div.style['font-size'] = '12px';
    this.div.style['line-height'] = '12px';

    var truncated = new Truncate(this.div, {
      lines: 2,
      lineHeight: 12,
      showMore: '',
      showLess: ''
    });

    assert.equal(this.div.clientHeight, 24);
    assert.equal(this.div.innerHTML, 'members, friends, adversaries, competitors, and colleagues--<!--- test -->');
  });
});

/* Scenario:
  box
    with margin
    with padding

  children elements
    floating elements
    inline elements
    block elements

  with comments


      <div id="test" style="width: 330px; border: 1px solid black;"> has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries: personal computers, animated movies, music, phones, tablet computing, and digital publishing.
At a time when America is seeking ways to sustain its innovative edge, and when societies around the world are trying to build digital-age economies, Jobs stands as the ultimate icon of inventiveness and applied imagination. He knew that the best way to create value in the twenty-first century was to connect creativity with technology. He built a company where leaps of the imagination were combined with remarkable feats of engineering.</div>
*/
