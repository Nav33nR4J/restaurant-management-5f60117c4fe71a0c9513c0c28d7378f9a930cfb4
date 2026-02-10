# Task: Fix Layout Errors and Price Editing - COMPLETED ✓

## Issues Fixed:

### 1. `_layout.tsx` - Maximum Update Depth Error
**Problem**: Infinite re-render caused by `headerRight` callback dependencies
**Solution**: 
- Moved `HeaderRight` logic into `useMemo` within `NavigationWrapper`
- Used stable function reference to prevent ScreenStackHeaderConfig crash

### 2. `MenuItemCard.tsx` - Stock Controls Overlap
**Problem**: `stockControlsContainer` used `position: "absolute"` causing overlap with other controls
**Solution**:
- Removed absolute positioning
- Added inline layout with `marginTop`, `paddingTop`, and `borderTop`
- Stock controls now appear below the main row with proper spacing

### 3. Click-to-Edit-Price Feature
**Problem**: Separate "edit_file Price" button cluttered the UI
**Solution**:
- Removed "edit_file Price" button
- Made price text clickable with `Pressable` component
- Added underline indicator for editable prices
- Added `handlePriceClick` callback to trigger pricing modal

## Files Modified:
1. **`app/_layout.tsx`** - Fixed infinite re-render
2. **`components/MenuItemCard.tsx`** - Fixed overlap, added click-to-edit-price
3. **`app/menu/index.tsx`** - Added `handleEditPrice` to dependency array

## Testing:
Type check passes for all modified files:
- `app/_layout.tsx` ✓
- `app/menu/index.tsx` ✓
- `components/MenuItemCard.tsx` ✓

