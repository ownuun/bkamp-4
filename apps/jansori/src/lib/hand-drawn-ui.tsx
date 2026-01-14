'use client';

import dynamic from 'next/dynamic';

export const Button = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Button),
  { ssr: false, loading: () => <button className="px-4 py-2 border-2 border-black rounded">Loading...</button> }
);

export const Card = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Card),
  { ssr: false, loading: () => <div className="border-2 border-black rounded p-4">Loading...</div> }
);

export const Input = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Input),
  { ssr: false, loading: () => <input className="border-2 border-black rounded px-3 py-2 w-full" /> }
);
