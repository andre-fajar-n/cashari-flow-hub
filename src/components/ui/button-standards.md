# Button Standardization Guide

## Button Variants & Usage

### 1. **Primary Actions (variant="default")**
- **Usage**: Main actions, form submission, confirmation
- **Examples**: "Save", "Add", "Submit", "Login"
- **Style**: Primary background, white text, shadow

```tsx
<Button>Save</Button>
<Button type="submit">Submit</Button>
```

### 2. **Secondary Actions (variant="outline")**
- **Usage**: Secondary actions, edit, view, navigation
- **Examples**: "Edit", "Detail", "History", "View"
- **Style**: Border, transparent background, hover accent

```tsx
<Button variant="outline">Edit</Button>
<Button variant="outline">Detail</Button>
```

### 3. **Destructive Actions (variant="destructive")**
- **Usage**: Delete, permanent cancel actions
- **Examples**: "Delete", "Remove"
- **Style**: Red background, white text

```tsx
<Button variant="destructive">Delete</Button>
```

### 4. **Cancel Actions (variant="ghost")**
- **Usage**: Cancel, close dialog
- **Examples**: "Cancel", "Close"
- **Style**: Transparent, hover accent

```tsx
<Button variant="ghost">Cancel</Button>
```

### 5. **Navigation Links (variant="link")**
- **Usage**: Navigation links
- **Style**: Underline, no background

```tsx
<Button variant="link">View Details</Button>
```

## Button Sizes

### 1. **Small (size="sm")**
- **Usage**: Action buttons in lists/cards, toolbar
- **Height**: 36px (h-9)

```tsx
<Button variant="outline" size="sm">Edit</Button>
```

### 2. **Default (size="default")**
- **Usage**: Form buttons, primary actions
- **Height**: 40px (h-10)

```tsx
<Button>Save</Button>
```

### 3. **Large (size="lg")**
- **Usage**: Hero buttons, prominent CTAs
- **Height**: 44px (h-11)

```tsx
<Button size="lg">Get Started</Button>
```

### 4. **Icon (size="icon")**
- **Usage**: Icon-only buttons
- **Size**: 40x40px (h-10 w-10)

```tsx
<Button variant="ghost" size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

## Icon Guidelines

### Icon Size Standards
- **Small buttons**: `w-3 h-3` (12px)
- **Default buttons**: `w-4 h-4` (16px)
- **Large buttons**: `w-5 h-5` (20px)

### Icon Positioning
- **With text**: Icon first, then text with `mr-1` or `mr-2`
- **Icon only**: Use `size="icon"` variant

```tsx
<Button variant="outline" size="sm">
  <Edit className="w-3 h-3 mr-1" />
  Edit
</Button>
```

## Common Patterns

### 1. **Form Actions**
```tsx
<div className="flex justify-end gap-2 pt-4">
  <Button variant="ghost" onClick={() => onCancel()}>
    Cancel
  </Button>
  <Button type="submit" disabled={isLoading}>
    {isLoading ? "Saving..." : "Save"}
  </Button>
</div>
```

### 2. **List Item Actions**
```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">
    <Eye className="w-3 h-3 mr-1" />
    View
  </Button>
  <Button variant="outline" size="sm">
    <Edit className="w-3 h-3 mr-1" />
    Edit
  </Button>
  <Button variant="destructive" size="sm">
    <Trash2 className="w-3 h-3 mr-1" />
    Delete
  </Button>
</div>
```

### 3. **Header Actions**
```tsx
<Button className="w-full sm:w-auto">
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>
```

### 4. **Empty State**
```tsx
<Button className="mt-4">
  <Plus className="w-4 h-4 mr-2" />
  Add First Item
</Button>
```

## DO NOT Use Custom Classes

❌ **Avoid**:
```tsx
<Button className="bg-blue-600 hover:bg-blue-700">
<Button className="bg-red-600 hover:bg-red-700">
```

✅ **Use**:
```tsx
<Button>Default Primary</Button>
<Button variant="destructive">Delete Action</Button>
```

## Responsive Considerations

- Use `w-full sm:w-auto` for mobile-first responsive buttons
- Prefer `size="sm"` for mobile list actions
- Use `gap-2` for button groups
