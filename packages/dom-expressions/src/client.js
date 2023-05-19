import {
  Properties,
  ChildProperties,
  Aliases,
  getPropAlias,
  SVGNamespace,
} from "./constants";

export function template(html, isCE, isSVG) {
  let node;
  const create = () => {
    const t = document.createElement("template");
    t.innerHTML = html;
    return isSVG ? t.content.firstChild.firstChild : t.content.firstChild;
  };

  return isCE
    ? () => (node || (node = create())).cloneNode(true)
    : () => document.importNode(node || (node = create()), true);
}

export function setAttribute(node, name, value) {
  if (value == null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}

export function setAttributeNS(node, namespace, name, value) {
  if (value == null) node.removeAttributeNS(namespace, name);
  else node.setAttributeNS(namespace, name, value);
}

export function className(node, value) {
  if (value == null) node.removeAttribute("class");
  else node.className = value;
}

export function addEventListener(node, name, handler, delegate) {
  if (delegate) {
    if (Array.isArray(handler)) {
      node[`$$${name}`] = handler[0];
      node[`$$${name}Data`] = handler[1];
    } else node[`$$${name}`] = handler;
  } else if (Array.isArray(handler)) {
    const handlerFn = handler[0];
    node.addEventListener(name, (handler[0] = e => handlerFn.call(node, handler[1], e)));
  } else node.addEventListener(name, handler);
}

export function classList(node, value, prev = {}) {
  const classKeys = Object.keys(value || {}),
    prevKeys = Object.keys(prev);
  let i, len;
  for (i = 0, len = prevKeys.length; i < len; i++) {
    const key = prevKeys[i];
    if (!key || key === "undefined" || value[key]) continue;
    toggleClassKey(node, key, false);
    delete prev[key];
  }
  for (i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i],
      classValue = !!value[key];
    if (!key || key === "undefined" || prev[key] === classValue || !classValue) continue;
    toggleClassKey(node, key, true);
    prev[key] = classValue;
  }
  return prev;
}

export function style(node, value) {
  if (!value) return;
  const nodeStyle = node.style;
  if (typeof value === "string") {
    nodeStyle.cssText = value;
    return;
  }
  if (typeof value !== "object")
    return;

  let v, s;
  for (s in value) {
    v = value[s];
    nodeStyle.setProperty(s, v);
  }
}

export function spread(node, props = {}, isSVG, skipChildren) {
  if (!skipChildren && "children" in props) {
    // note: ("children" in props) expression intentionally left in
    // this expression was removed in commit 8330127 so that children
    // were tracked with effect(). it has been added back as an
    // optimization
    insertExpression(node, props.children);
  }
  props.ref && props.ref(node);
  assign(node, props, isSVG, true, undefined, true);
}

export function mergeProps(...sources) {
  const target = {};
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];
    if (typeof source === "function") source = source();
    if (source) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
  }
  return target;
}

export function use(fn, element, arg) {
  return fn(element, arg);
}

export function insert(parent, accessor, marker) {
  if (typeof accessor !== "function") return insertExpression(parent, accessor, marker);
  insertExpression(parent, accessor(), marker);
}

export function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
  props || (props = {});
  for (const prop in props) {
    if (prop === "children") {
      if (!skipChildren) insertExpression(node, props.children);
      continue;
    }
    const value = props[prop];
    assignProp(node, prop, value, undefined, isSVG, skipRef);
  }
}

// Internal Functions
function toPropertyName(name) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}

function toggleClassKey(node, key, value) {
  const classNames = key.trim().split(/\s+/);
  for (let i = 0, nameLen = classNames.length; i < nameLen; i++)
    node.classList.toggle(classNames[i], value);
}

function assignProp(node, prop, value, prev, isSVG, skipRef) {
  let isCE, isProp, isChildProp, propAlias, forceProp;
  if (prop === "style") return style(node, value);
  if (prop === "classList") return classList(node, value, prev);
  if (value === prev) return prev;
  if (prop === "ref") {
    if (!skipRef) value(node);
  } else if (prop.slice(0, 3) === "on:") {
    const e = prop.slice(3);
    prev && node.removeEventListener(e, prev);
    value && node.addEventListener(e, value);
  } else if (prop.slice(0, 10) === "oncapture:") {
    const e = prop.slice(10);
    prev && node.removeEventListener(e, prev, true);
    value && node.addEventListener(e, value, true);
  } else if (prop.slice(0, 2) === "on") {
    const name = prop.slice(2).toLowerCase();
    value && addEventListener(node, name, value);
  } else if (prop.slice(0, 5) === "attr:") {
    setAttribute(node, prop.slice(5), value);
  } else if (
    (forceProp = prop.slice(0, 5) === "prop:") ||
    (isChildProp = ChildProperties.has(prop)) ||
    (!isSVG &&
      ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop)))) ||
    (isCE = node.nodeName.includes("-"))
  ) {
    if (forceProp) {
      prop = prop.slice(5);
      isProp = true;
    }
    if (prop === "class" || prop === "className") className(node, value);
    else if (isCE && !isProp && !isChildProp) node[toPropertyName(prop)] = value;
    else node[propAlias || prop] = value;
  } else {
    const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
    if (ns) setAttributeNS(node, ns, prop, value);
    else setAttribute(node, Aliases[prop] || prop, value);
  }
  return value;
}

function insertExpression(parent, value, marker, unwrapArray) {
  const t = typeof value,
    multi = marker !== undefined;

  if (t === "string" || t === "number") {
    if (t === "number") value = value.toString();
    if (multi) {
      const node = document.createTextNode(value);
      cleanChildren(parent, marker, node);
    } else {
      parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    cleanChildren(parent, marker);
  } else if (t === "function") {
    let v = value();
    while (typeof v === "function") v = v();
    insertExpression(parent, v, marker);
    return;
  } else if (Array.isArray(value)) {
    const array = [];
    if (normalizeIncomingArray(array, value, unwrapArray)) {
      insertExpression(parent, array, marker, true);
      return;
    }
    if (array.length === 0) {
      cleanChildren(parent, marker);
      if (multi) return;
    } else {
      appendNodes(parent, array, marker);
    }
  } else if (value instanceof Node) {
    if (multi)
      cleanChildren(parent, marker, value);
    else
      cleanChildren(parent, null, value);
  } else console.warn(`Unrecognized value. Skipped inserting`, value);
}

function normalizeIncomingArray(normalized, array, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
      t;
    if (item instanceof Node) {
      normalized.push(item);
    } else if (item == null || item === true || item === false) {
      // matches null, undefined, true or false
      // skip
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item) || dynamic;
    } else if ((t = typeof item) === "function") {
      if (unwrap) {
        while (typeof item === "function") item = item();
        dynamic =
          normalizeIncomingArray(
            normalized,
            Array.isArray(item) ? item : [item]
          ) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      // NOTE: is String better than `item + ''`, ``${item}``, `item.toString()` and `item.valueOf()`?
      const value = String(item);
      normalized.push(document.createTextNode(value));
    }
  }
  return dynamic;
}

function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}

function cleanChildren(parent, marker, replacement) {
  if (marker === undefined) return (parent.textContent = "");
  const node = replacement || document.createTextNode("");

  parent.insertBefore(node, marker);
}

export function createComponent(fn, props) {
  if (fn.isClassComponent) {
    const instance = new fn(props);
    if (!fn.isSelfMount)
      return instance.root;
    else
      return null;
  }
  return fn(props);
}
