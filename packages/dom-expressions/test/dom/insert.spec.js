/**
 * @jest-environment jsdom
 */
import * as r from '../../src/client';
import * as S from "s-js";

describe("r.insert", () => {
  // <div><!-- insert --></div>
  const container = document.createElement("div");

  it("inserts nothing for null", () => {
    const res = insert(null);
    expect(res.innerHTML).toBe("");
    expect(res.childNodes.length).toBe(0);
  });

  it("inserts nothing for undefined", () => {
    const res = insert(undefined);
    expect(res.innerHTML).toBe("");
    expect(res.childNodes.length).toBe(0);
  });

  it("inserts nothing for false", () => {
    const res = insert(false);
    expect(res.innerHTML).toBe("");
    expect(res.childNodes.length).toBe(0);
  });

  it("inserts nothing for true", () => {
    const res = insert(true);
    expect(res.innerHTML).toBe("");
    expect(res.childNodes.length).toBe(0);
  });

  it("inserts nothing for null in array", () => {
    const res = insert(["a", null, "b"]);
    expect(res.innerHTML).toBe("ab");
    expect(res.childNodes.length).toBe(2);
  });

  it("inserts nothing for undefined in array", () => {
    const res = insert(["a", undefined, "b"]);
    expect(res.innerHTML).toBe("ab");
    expect(res.childNodes.length).toBe(2);
  });

  it("inserts nothing for false in array", () => {
    const res = insert(["a", false, "b"]);
    expect(res.innerHTML).toBe("ab");
    expect(res.childNodes.length).toBe(2);
  });

  it("inserts nothing for true in array", () => {
    const res = insert(["a", true, "b"]);
    expect(res.innerHTML).toBe("ab");
    expect(res.childNodes.length).toBe(2);
  });

  it("can insert strings", () => {
    const res = insert("foo");
    expect(res.innerHTML).toBe("foo");
    expect(res.childNodes.length).toBe(1);
  });

  it("can insert a node", () => {
    const node = document.createElement("span");
    node.textContent = "foo";
    expect(insert(node).innerHTML).toBe("<span>foo</span>");
  });

  it("can re-insert a node, thereby moving it", () => {
    const node = document.createElement("span");
    node.textContent = "foo";

    const first = insert(node),
      second = insert(node);

    expect(first.innerHTML).toBe("");
    expect(second.innerHTML).toBe("<span>foo</span>");
  });

  it('can spread over element', () => {
    const node = document.createElement("span");
    S.root(() => {
      r.spread(node, {href: '/', for: 'id', classList: {danger: true}, on: {custom: e => e}, style: {color: 'red'}, notProp: 'good'})
    })
    expect(node.getAttribute('href')).toBe('/');
    expect(node.getAttribute('for')).toBe('id');
    expect(node.className).toBe('danger');
    expect(node.style.color).toBe('red');
    expect(node.notProp).toBeUndefined();
    expect(node.getAttribute("notprop")).toBe('good');
  })

  it("can insert an array of strings", () => {
    expect(insert(["foo", "bar"]).innerHTML).toBe("foobar", "array of strings");
  });

  it("can insert an array of nodes", () => {
    const nodes = [ document.createElement("span"), document.createElement("div")];
    nodes[0].textContent = "foo";
    nodes[1].textContent = "bar";
    expect(insert(nodes).innerHTML).toBe("<span>foo</span><div>bar</div>");
  });

  it("can insert nested arrays", () => {
    expect(insert(["foo", ["bar", "blech"]]).innerHTML)
    .toBe("foobarblech", "array of array of strings");
  });

  it("can insert and clear strings", () => {
    var parent = document.createElement("div")
    r.insert(parent, 'foo');
    expect(parent.innerHTML).toBe('foo');
    expect(parent.childNodes.length).toBe(1);
    r.insert(parent, '', undefined, 'foo');
    expect(parent.innerHTML).toBe('');
  });

  function insert(val) {
    const parent = container.cloneNode(true);
    r.insert(parent, val);
    return parent;
  }
});

describe("r.insert with Markers", () => {
  // <div>before<!-- insert -->after</div>
  var container = document.createElement("div");
  container.appendChild(document.createTextNode("before"));
  container.appendChild(document.createTextNode("after"));

  it("inserts nothing for null", () => {
    const res = insert(null);
    expect(res.innerHTML).toBe("beforeafter");
    expect(res.childNodes.length).toBe(3);
  });

  it("inserts nothing for undefined", () => {
    const res = insert(undefined);
    expect(res.innerHTML).toBe("beforeafter");
    expect(res.childNodes.length).toBe(3);
  });

  it("inserts nothing for false", () => {
    const res = insert(false);
    expect(res.innerHTML).toBe("beforeafter");
    expect(res.childNodes.length).toBe(3);
  });

  it("inserts nothing for true", () => {
    const res = insert(true);
    expect(res.innerHTML).toBe("beforeafter");
    expect(res.childNodes.length).toBe(3);
  });

  it("inserts nothing for null in array", () => {
    const res = insert(["a", null, "b"]);
    expect(res.innerHTML).toBe("beforeabafter");
    expect(res.childNodes.length).toBe(4);
  });

  it("inserts nothing for undefined in array", () => {
    const res = insert(["a", undefined, "b"]);
    expect(res.innerHTML).toBe("beforeabafter");
    expect(res.childNodes.length).toBe(4);
  });

  it("inserts nothing for false in array", () => {
    const res = insert(["a", false, "b"]);
    expect(res.innerHTML).toBe("beforeabafter");
    expect(res.childNodes.length).toBe(4);
  });

  it("inserts nothing for true in array", () => {
    const res = insert(["a", true, "b"]);
    expect(res.innerHTML).toBe("beforeabafter");
    expect(res.childNodes.length).toBe(4);
  });

  it("can insert strings", () => {
    const res = insert("foo");
    expect(res.innerHTML).toBe("beforefooafter");
    expect(res.childNodes.length).toBe(3);
  });

  it("can insert a node", () => {
    const node = document.createElement("span");
    node.textContent = "foo";
    expect(insert(node).innerHTML).toBe("before<span>foo</span>after");
  });

  it("can re-insert a node, thereby moving it", () => {
    var node = document.createElement("span");
    node.textContent = "foo";

    const first = insert(node),
      second = insert(node);

    expect(first.innerHTML).toBe("beforeafter");
    expect(second.innerHTML).toBe("before<span>foo</span>after");
  });

  it("can insert an array of strings", () => {
    expect(insert(["foo", "bar"]).innerHTML)
      .toBe("beforefoobarafter", "array of strings");
  });

  it("can insert an array of nodes", () => {
    const nodes = [ document.createElement("span"), document.createElement("div")];
    nodes[0].textContent = "foo";
    nodes[1].textContent = "bar";
    expect(insert(nodes).innerHTML).toBe("before<span>foo</span><div>bar</div>after");
  });

  it("can insert nested arrays", () => {
    expect(insert(["foo", ["bar", "blech"]]).innerHTML)
      .toBe("beforefoobarblechafter", "array of array of strings");
  });

  it("can insert and clear strings with marker", () => {
    var parent = document.createElement("div");
    parent.innerHTML = ' bar';
    var marker = parent.firstChild;
    let current = r.insert(parent, 'foo', marker);
    expect(parent.innerHTML).toBe('foo bar');
    expect(parent.childNodes.length).toBe(2);
    // r.insert(parent, '', marker, current);
    // expect(parent.innerHTML).toBe(' bar');
  });

  it("can insert and clear strings with null marker", () => {
    var parent = document.createElement("div");
    parent.innerHTML = 'hello ';
    let current = r.insert(parent, 'foo', null);
    expect(parent.innerHTML).toBe('hello foo');
    expect(parent.childNodes.length).toBe(2);
    // r.insert(parent, '', null, current);
    // expect(parent.innerHTML).toBe('hello ');
  });

  function insert(val) {
    const parent = container.cloneNode(true);
    r.insert(parent, val, parent.childNodes[1]);
    return parent;
  }
});