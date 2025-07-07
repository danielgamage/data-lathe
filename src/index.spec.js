import * as lathe from '../index';
import { describe, test, expect } from 'vitest';

describe('data-lathe core functions', () => {
  test('biToUni maps -1 to 0 and 1 to 1', () => {
    expect(lathe.biToUni(-1)).toBeCloseTo(0);
    expect(lathe.biToUni(0)).toBeCloseTo(0.5);
    expect(lathe.biToUni(1)).toBeCloseTo(1);
  });

  test('uniToBi maps 0 to -1 and 1 to 1', () => {
    expect(lathe.uniToBi(0)).toBeCloseTo(-1);
    expect(lathe.uniToBi(0.5)).toBeCloseTo(0);
    expect(lathe.uniToBi(1)).toBeCloseTo(1);
  });

  test('clamp clamps values within min and max', () => {
    expect(lathe.clamp(5, 0, 10)).toBe(5);
    expect(lathe.clamp(-1, 0, 10)).toBe(0);
    expect(lathe.clamp(11, 0, 10)).toBe(10);
  });

  test('lerp interpolates between a and b', () => {
    expect(lathe.lerp(0, 10, 20)).toBe(10);
    expect(lathe.lerp(1, 10, 20)).toBe(20);
    expect(lathe.lerp(0.5, 10, 20)).toBe(15);
  });

  test('tanh returns Math.tanh(x * gain)', () => {
    expect(lathe.tanh(0)).toBeCloseTo(0);
    expect(lathe.tanh(1)).toBeCloseTo(Math.tanh(1));
    expect(lathe.tanh(1, 2)).toBeCloseTo(Math.tanh(2));
  });

  test('quadraticThroughAGivenPoint passes through (0,0), (x,y), (1,1)', () => {
    expect(lathe.quadraticThroughAGivenPoint(0, 0.5, 0.5)).toBeCloseTo(0);
    expect(lathe.quadraticThroughAGivenPoint(1, 0.5, 0.5)).toBeCloseTo(1);
    expect(lathe.quadraticThroughAGivenPoint(0.5, 0.5, 0.5)).toBeCloseTo(0.5);
  });

  test('ease returns linear for order 0', () => {
    expect(lathe.ease(0.5, 0)).toBeCloseTo(0.5);
  });

  test('quadraticBezier returns input for x=0.5', () => {
    expect(lathe.quadraticBezier(0.3, 0.5, 0.5)).toBeCloseTo(0.3);
  });

  test('quantize snaps to nearest step', () => {
    expect(lathe.quantize(0.23, 0.1)).toBeCloseTo(0.2);
    expect(lathe.quantize(0.23, 0.1, 'ceil')).toBeCloseTo(0.3);
    expect(lathe.quantize(0.23, 0.1, 'floor')).toBeCloseTo(0.2);
  });

  test('fold produces values in [0,1]', () => {
    for (let i = -2; i <= 2; i += 0.1) {
      const v = lathe.fold(i, 1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  test('sineFold produces values in [0,1]', () => {
    for (let i = -2; i <= 2; i += 0.1) {
      const v = lathe.sineFold(i, 1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  test('logistic returns 0 for input 0 and gain 0', () => {
    expect(lathe.logistic(0, 0)).toBeCloseTo(0);
  });

  test('smoothStep returns 0 below edge0 and 1 above edge1', () => {
    expect(lathe.smoothStep(-1, 0, 1)).toBe(0);
    expect(lathe.smoothStep(2, 0, 1)).toBe(1);
    expect(lathe.smoothStep(0.5, 0, 1)).toBeCloseTo(0.5);
  });

  test('linearStep clamps between 0 and 1', () => {
    expect(lathe.linearStep(-1, 0, 1)).toBe(0);
    expect(lathe.linearStep(2, 0, 1)).toBe(1);
    expect(lathe.linearStep(0.5, 0, 1)).toBeCloseTo(0.5);
  });

  test('polyline returns midpointY at midpointX', () => {
    expect(lathe.polyline(0.5, 0.5, 0.8)).toBeCloseTo(0.8);
  });

  test('mirrorAcrossY mirrors function output', () => {
    const fn = x => x * 2;
    expect(lathe.mirrorAcrossY(-2, fn)).toBe(4);
    expect(lathe.mirrorAcrossY(2, fn)).toBe(4);
  });

  test('mirrorAcrossOrigin mirrors function output with sign', () => {
    const fn = x => x * 2;
    expect(lathe.mirrorAcrossOrigin(-2, fn)).toBe(-4);
    expect(lathe.mirrorAcrossOrigin(2, fn)).toBe(4);
  });

  test('inflectionThroughPoint passes through (0,0), (x,y), (1,1)', () => {
    const fn = x => x;
    expect(lathe.inflectionThroughPoint(0, 0.5, 0.5, fn)).toBeCloseTo(0);
    expect(lathe.inflectionThroughPoint(0.5, 0.5, 0.5, fn)).toBeCloseTo(0.5);
    expect(lathe.inflectionThroughPoint(1, 0.5, 0.5, fn)).toBeCloseTo(1);
  });

  // Test for remapRange if it exists
  test('remapRange remaps value from one range to another', () => {
    if (typeof lathe.remapRange === 'function') {
      expect(lathe.remapRange(0.5, 0, 1, 0, 10)).toBeCloseTo(5);
      expect(lathe.remapRange(0, 0, 1, 10, 20)).toBeCloseTo(10);
      expect(lathe.remapRange(1, 0, 1, 10, 20)).toBeCloseTo(20);
    }
  });
});