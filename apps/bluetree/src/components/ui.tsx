'use client';

import dynamic from 'next/dynamic';

export const Button = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Button),
  { ssr: false }
);

export const Card = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Card),
  { ssr: false }
);

export const Input = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Input),
  { ssr: false }
);

export const Textarea = dynamic(
  () => import('@recklyss/hand-drawn-ui').then((mod) => mod.Textarea),
  { ssr: false }
);
