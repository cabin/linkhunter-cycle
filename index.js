import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';
import storageDriver from '@cycle/storage';
import {makeDOMDriver} from '@cycle/dom';
import _ from 'lodash';
import {Observable} from 'rx';

import {img, div, input, ul, li, a, p, header, span} from '@cycle/dom';


const DATA = [
  {
    title: 'Getting Started with Cycle.js',
    url: 'http://cycle.js.org/getting-started.html',
  },
  {
    title: 'Zak Johnson',
    url: 'http://zakj.net/',
  },
  {
    title: 'Cabin',
    url: 'http://madebycabin.com/',
  },
  {
    title: 'How to make help microvideos for your website | Holovaty',
    url: 'http://www.holovaty.com/writing/microvideos/',
  },
];

function intent(DOM) {
  const filterText$ = DOM.select('input').events('input')
    .map(ev => ev.target.value)
    .distinctUntilChanged();
  const addBookmark$ = DOM.select('.add-bookmark').events('submit')

//   const newBookmark$ = button1.click$
//     .map(() => ({title: 'test', url: '/'}));

//   // TODO: also send newBookmark$ to pinboard/delicious

//   const storageRequest$ = newBookmark$
//     .withLatestFrom(bookmarks$, (bookmark, bookmarks) => bookmarks.concat([bookmark]))
//     .map(bookmarks => ({key: 'bookmarks', value: JSON.stringify(bookmarks)}));



  return {
    filterText$,
  };
}

function model({filterText$}, storage) {
  const matchRank = (bookmark, filter) => {
    if (bookmark.title.includes(filter)) return 3;
    if (bookmark.title.toLowerCase().includes(filter.toLowerCase())) return 2;
    // TODO: test for multiple word matches, fuzzy match, tags
    return 0;
  };

  return Observable.combineLatest(
    filterText$.startWith(''),
    storage.getItem('bookmarks')
      .map(bookmarks => JSON.parse(bookmarks))
      .map(v => v === null ? DATA : v),  // TODO: wish I could use startWith instead
    (filterText, bookmarks) => ({
      bookmarks: _(bookmarks)
        .map(b => [matchRank(b, filterText), b])
        .filter(([rank]) => rank > 0)
        .orderBy(([rank]) => rank, 'desc')
        .map(([, bookmark]) => bookmark)
        .value(),
    })
  );
}

function faviconURL(url) {
  const a = document.createElement('a');
  a.href = url;
  // TODO: fetch favicon, compare contents to the default, replace if needed.
  // how to do that async? sounds like a driver... or at least use http driver
  return `https://icons.duckduckgo.com/ip2/${a.host}.ico`;
  // return `https://plus.google.com/_/favicon?domain_url=${url}`;
}

function view(state$) {
  return state$.map(state =>
    div([
      header([
        input({autofocus: true}),
        a('.button', {href: '#add'}, 'Add bookmark'),
        a('.button', {href: '#config'}, 'Settings'),
      ]),
      p('.error'),
      div('.results', [ul(
        _.map(state.bookmarks, (bookmark) => li([
          img({width: 16, height: 16, src: faviconURL(bookmark.url)}),
          ' ',
          a({href: bookmark.url}, bookmark.title),
        ]))
      )]),
    ])
  );
}

function main({DOM, storage}) {
  const actions = intent(DOM);
  const state$ = model(actions, storage.local);
  const vtree$ = view(state$);
  const storageRequest$ = XXX
  return {
    DOM: vtree$,
    storage: state$.map(state => state.storageRequest$),
  };
}

const sources = {
  DOM: makeDOMDriver('.linkhunter'),
  storage: storageDriver,
};

Cycle.run(main, sources);



// function filterBookmarks(bookmarks, needle) {
//   return bookmarks.filter(b => b.title.toLowerCase().match(needle));
// }

// function Button({DOM, props$}) {
//   const click$ = DOM.events('click');

//   return {
//     DOM: props$.map(props => button(props.label)),
//     click$,
//   };
// }


// function oldMain({DOM, storage}) {
//   const bookmarks$ = storage.local.getItem('bookmarks')
//     .map(s => s ? JSON.parse(s) : DATA);

//   const searchInput = SearchInput({DOM});
//   const filteredBookmarks$ = bookmarks$.combineLatest(searchInput.value$, filterBookmarks);
//   const bookmarksList = BookmarksList({bookmarks$: filteredBookmarks$});

//   const Button1 = isolate(Button);
//   const Button2 = isolate(Button);
//   const button1 = Button1({DOM, props$: Observable.of({label: 'Press me!'})});
//   const button2 = Button2({DOM, props$: Observable.of({label: 'Not me!'})});

//   const newBookmark$ = button1.click$
//     .map(() => ({title: 'test', url: '/'}));

//   // TODO: also send newBookmark$ to pinboard/delicious

//   const storageRequest$ = newBookmark$
//     .withLatestFrom(bookmarks$, (bookmark, bookmarks) => bookmarks.concat([bookmark]))
//     .map(bookmarks => ({key: 'bookmarks', value: JSON.stringify(bookmarks)}));

//   return {
//     DOM: Observable.combineLatest(searchInput.DOM, bookmarksList.DOM, button1.DOM, button2.DOM, (searchInput$, bookmarksList$, button1$, button2$) =>
//       div([searchInput$, bookmarksList$, button1$, ' ', button2$])
//     ),
//     storage: storageRequest$,
//   };
// }

// function SearchInput({DOM}) {
//   const value$ = DOM.select('input').events('input')
//     .map(event => event.target.value.toLowerCase())
//     .filter(str => str.length > 1)
//     .distinctUntilChanged()
//     .startWith('');

//   return {
//     DOM: Observable.just(input()),
//     value$,
//   };
// }

// function BookmarksList({bookmarks$}) {
//   return {
//     DOM: bookmarks$.map(bookmarks =>
//       ul(bookmarks.map(bookmark => li([a({href: bookmark.url}, bookmark.title)])))
//     ),
//   };
// }
