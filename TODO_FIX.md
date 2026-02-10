# Fix for "given parent has 2 child" Error

## Problem
The error "given parent has 2 child" occurs when React components are re-created unnecessarily on each render, causing conflicts with React Native's navigation system and component reconciliation.

## Root Causes
1. Inline callback functions that are recreated on every render
2. Components that don't use `memo` or `useMemo` properly
3. Navigation header components being recreated

## Plan

### Step 1: Fix `app/menu/index.tsx` - COMPLETED
- [x] Memoize `handleEditPrice` callback using `useCallback`
- [x] Memoize `renderMenuItem` callback using `useCallback` with proper dependencies
- [x] Wrap `getAvailableItemsForSeasonalMenu` and `filteredAvailableItems` with `useCallback`
- [x] Memoize all modal close handlers
- [x] Replace inline callbacks in JSX with memoized handlers

### Step 2: Check other components for similar issues
- [ ] Check `app/cart.tsx` for similar inline callback issues
- [ ] Check `BranchPricingModal.tsx` for proper memoization
- [ ] Check `MenuItemCard.tsx` for proper memoization patterns

### Step 3: Verify the fix
- [ ] Test the app to ensure the error is resolved
- [ ] Check for any console warnings related to component re-renders

## Changes Made

### Fixed in `app/menu/index.tsx`

1. **Added memoized handlers:**
   - `handleEditPrice` - for editing item prices
   - `handleToggleTheme` - for toggling theme
   - `handleOpenAddMenuModal` - for opening add menu modal
   - `handleClosePricingModal` - for closing pricing modal
   - `handleCloseAddMenuModal` - for closing add menu modal
   - `handleCloseSeasonalMenuModal` - for closing seasonal menu modal
   - `handleCloseSeasonalMenuList` - for closing seasonal menu list modal
   - `handleCloseAddItemsModal` - for closing add items modal
   - `handleCloseSpecialMenuModal` - for closing special menu modal
   - `handleCreateSeasonalMenuFromList` - for creating seasonal menu from list

2. **Updated JSX to use memoized handlers:**
   - `ListHeaderComponent` props
   - All `Modal` components' `onRequestClose` props
   - All `ModalButtons` components' `onCancel` props
   - All `ActionButton` components' `onPress` props

### Why This Fixes the Error

The "given parent has 2 child" error occurs when:
1. React components are re-created on every render
2. React Native's reconciliation process detects the same component being added twice
3. Navigation header components are particularly sensitive to this

By memoizing callbacks with `useCallback`, we ensure that:
1. Function references remain stable across renders
2. Child components don't re-render unnecessarily
3. Navigation and modal systems receive consistent component references

