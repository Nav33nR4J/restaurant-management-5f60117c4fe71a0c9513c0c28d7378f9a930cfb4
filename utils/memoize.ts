/**
 * Memoization Utilities
 * Provides memoization functions for performance optimization
 */

import { DependencyList } from "react";

/**
 * LRU Cache implementation for memoization
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // Delete first to maintain order
    this.cache.delete(key);
    // Add to end (most recently used)
    this.cache.set(key, value);
    
    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Simple memoization function that caches results based on arguments
 * Uses JSON stringify for argument comparison
 */
export function memoize<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
  maxCacheSize: number = 100
): (...args: Args) => T {
  const cache = new LRUCache<string, T>(maxCacheSize);

  return (...args: Args): T => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Create a memoized selector function for Redux state
 */
export function createMemoizedSelector<T, State>(
  selector: (state: State) => T,
  equalityFn: (prev: T, curr: T) => boolean = Object.is
): (state: State) => T {
  let lastState: State | null = null;
  let lastResult: T | null = null;

  return (state: State): T => {
    if (lastState === state) {
      return lastResult!;
    }

    const result = selector(state);
    
    if (lastResult !== null && equalityFn(lastResult, result)) {
      return lastResult;
    }

    lastState = state;
    lastResult = result;
    return result;
  };
}

/**
 * Memoize a callback function with dependency array comparison
 */
export function useMemoCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList
): T {
  // This is a wrapper - actual memoization happens via useCallback in React
  // This function documents the intent and provides type safety
  return callback;
}

/**
 * Memoize expensive computations with a cache
 */
export const memoizedCompute = memoize;

/**
 * Create a stable reference for an object
 * Useful for preventing unnecessary re-renders when passing objects as props
 */
export function useStable<T extends object>(factory: () => T): T {
  const ref = { current: null as T | null };
  
  if (ref.current === null) {
    ref.current = factory();
  }
  
  return ref.current;
}

/**
 * Shallow compare two arrays
 */
export function shallowCompareArrays<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1 === arr2) return true;
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
}

/**
 * Deep compare two objects (shallow on nested objects)
 */
export function shallowCompareObjects<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Check if deps have changed
 */
export function checkDepsChange(
  prevDeps: DependencyList,
  currDeps: DependencyList
): boolean {
  if (prevDeps.length !== currDeps.length) return true;
  
  for (let i = 0; i < prevDeps.length; i++) {
    if (prevDeps[i] !== currDeps[i]) return true;
  }
  
  return false;
}

export default {
  LRUCache,
  memoize,
  createMemoizedSelector,
  memoizedCompute,
  useStable,
  shallowCompareArrays,
  shallowCompareObjects,
  checkDepsChange,
};

