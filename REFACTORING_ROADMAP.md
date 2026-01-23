# 🚀 Complete Refactoring Roadmap

## 📋 Overview

**Goal**: Refactor entire React/Next.js codebase to follow professional best practices  
**Approach**: Incremental, phase-by-phase migration  
**Timeline**: 4-6 weeks (can be parallelized)

### Key Improvements
- ✅ React Hook Form for all forms
- ✅ React Query for all data fetching
- ✅ Proper TypeScript types (no `any`)
- ✅ Clean component structure
- ✅ Reusable UI components
- ✅ Service layer for API calls
- ✅ Custom hooks for data fetching
- ✅ Extracted icons
- ✅ Organized folder structure

---

## 📦 Phase 0: Preparation & Setup

### Step 0.1: Install Dependencies

```bash
npm install @tanstack/react-query@^5.0.0 @tanstack/react-query-devtools@^5.0.0
npm install react-hook-form@^7.50.0 @hookform/resolvers@^3.3.0
npm install zod@^3.22.0
npm install clsx@^2.1.0 tailwind-merge@^2.2.0
```

### Step 0.2: Create Folder Structure

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   ├── Checkbox.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── SuccessMessage.tsx
│   └── icons/
│       ├── index.ts
│       ├── IconDashboard.tsx
│       ├── IconDocuments.tsx
│       ├── IconUsers.tsx
│       ├── IconStats.tsx
│       ├── IconSettings.tsx
│       ├── IconUpload.tsx
│       ├── IconEdit.tsx
│       ├── IconDelete.tsx
│       ├── IconView.tsx
│       ├── IconClose.tsx
│       └── IconFile.tsx
├── forms/
│   ├── ProfileForm/
│   │   ├── ProfileForm.tsx
│   │   ├── ProfileFormFields.tsx
│   │   ├── useProfileForm.ts
│   │   └── profileFormSchema.ts
│   ├── DocumentUploadForm/
│   │   ├── DocumentUploadForm.tsx
│   │   ├── DocumentUploadFields.tsx
│   │   ├── useDocumentUploadForm.ts
│   │   └── documentUploadSchema.ts
│   ├── DocumentEditForm/
│   │   ├── DocumentEditForm.tsx
│   │   ├── DocumentEditFields.tsx
│   │   ├── useDocumentEditForm.ts
│   │   └── documentEditSchema.ts
│   └── SignUpForm/
│       ├── SignUpForm.tsx
│       ├── SignUpFormFields.tsx
│       ├── useSignUpForm.ts
│       └── signUpFormSchema.ts
└── [keep existing structure for other components]

services/
├── api/
│   ├── documents.ts
│   ├── users.ts
│   ├── profiles.ts
│   ├── stats.ts
│   ├── downloadLogs.ts
│   └── subadmins.ts
└── queryClient.ts

hooks/
├── api/
│   ├── useDocuments.ts
│   ├── useUsers.ts
│   ├── useProfiles.ts
│   ├── useStats.ts
│   ├── useDownloadLogs.ts
│   └── useSubadmins.ts
├── useDebounce.ts (keep existing)
└── useLocalStorage.ts

lib/
├── providers/
│   └── QueryProvider.tsx
└── utils/
    ├── cn.ts (className utility)
    └── validation.ts
```

### Step 0.3: Create Utility Files

**File**: `lib/utils/cn.ts`
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Checklist**:
- [ ] All dependencies installed
- [ ] Folder structure created
- [ ] Utility files created
- [ ] No errors in installation

---

## 🏗️ Phase 1: Foundation (Week 1)

### Step 1.1: Set Up React Query Provider

**File**: `lib/providers/QueryProvider.tsx`

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

**Update**: `app/layout.tsx` - Wrap children with QueryProvider

**Checklist**:
- [ ] QueryProvider created
- [ ] Root layout updated
- [ ] App runs without errors
- [ ] React Query DevTools visible in dev mode

### Step 1.2: Create Base UI Components

Create reusable UI components:
- `components/ui/Button.tsx` - Button with variants (primary, secondary, danger, ghost)
- `components/ui/Input.tsx` - Text input with proper styling
- `components/ui/Select.tsx` - Select dropdown
- `components/ui/Textarea.tsx` - Textarea input
- `components/ui/Checkbox.tsx` - Checkbox input
- `components/ui/Modal.tsx` - Modal wrapper component

**Checklist**:
- [ ] All UI components created
- [ ] Components have proper TypeScript types
- [ ] Components are accessible
- [ ] Test page created to verify components work

### Step 1.3: Extract Icons

**Task**: Extract all inline SVGs to `components/ui/icons/`

**Icons to Extract**:
- Dashboard icon
- Documents icon
- Users icon
- Stats icon
- Settings icon
- Upload icon
- Edit icon
- Delete icon
- View icon
- Close icon
- File type icons

**Checklist**:
- [ ] All icons extracted
- [ ] Icon components have proper props
- [ ] Icons can be imported from `@/components/ui/icons`
- [ ] Replace 2-3 inline SVGs to test

---

## 🔧 Phase 2: Service Layer (Week 1-2)

### Step 2.1: Create Document Service

**File**: `services/api/documents.ts`

**Functions to Implement**:
- `getDocuments(filters)` - Fetch documents with filters
- `getDocumentById(id)` - Get single document
- `uploadDocument(data)` - Upload new document
- `updateDocument(id, data)` - Update document
- `deleteDocument(id)` - Delete document
- `getVersions(id)` - Get document versions
- `getDownloadUrl(id)` - Get signed download URL
- `convertDocument(id)` - Convert for editor
- `exportDocument(id, format)` - Export document

**Checklist**:
- [ ] Service file created
- [ ] All functions implemented
- [ ] Proper error handling
- [ ] TypeScript types defined
- [ ] Test with one API call

### Step 2.2: Create User/Profile Service

**Files**:
- `services/api/users.ts`
- `services/api/profiles.ts`

**Functions**:
- User management operations
- Profile CRUD operations
- Username checking
- Password updates

**Checklist**:
- [ ] Services created
- [ ] All functions implemented
- [ ] Error handling added
- [ ] Types defined

### Step 2.3: Create Remaining Services

**Files**:
- `services/api/stats.ts`
- `services/api/downloadLogs.ts`
- `services/api/subadmins.ts`

**Checklist**:
- [ ] All services created
- [ ] Consistent error handling
- [ ] All API endpoints covered
- [ ] Types defined for all responses

---

## 🎣 Phase 3: React Query Hooks (Week 2)

### Step 3.1: Create Document Hooks

**File**: `hooks/api/useDocuments.ts`

**Hooks to Create**:
- `useDocuments(filters)` - Query hook
- `useDocument(id)` - Query hook
- `useDocumentVersions(id)` - Query hook
- `useUploadDocument()` - Mutation hook
- `useUpdateDocument()` - Mutation hook
- `useDeleteDocument()` - Mutation hook

**Query Keys**:
```typescript
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters?: DocumentFilters) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  versions: (id: string) => [...documentKeys.detail(id), 'versions'] as const,
}
```

**Checklist**:
- [ ] All hooks created
- [ ] Query keys defined
- [ ] Mutations invalidate queries
- [ ] Loading/error states handled
- [ ] Test with one component

### Step 3.2: Create User/Profile Hooks

**Files**:
- `hooks/api/useUsers.ts`
- `hooks/api/useProfiles.ts`

**Checklist**:
- [ ] Hooks created
- [ ] Query keys defined
- [ ] Mutations work correctly
- [ ] Test with components

### Step 3.3: Create Remaining Hooks

**Files**:
- `hooks/api/useStats.ts`
- `hooks/api/useDownloadLogs.ts`
- `hooks/api/useSubadmins.ts`

**Checklist**:
- [ ] All hooks created
- [ ] Consistent patterns
- [ ] All tested

---

## 📝 Phase 4: Form Refactoring (Week 3-4)

### Step 4.1: Document Upload Form

**Files to Create**:
1. `components/forms/DocumentUploadForm/documentUploadSchema.ts` - Zod schema
2. `components/forms/DocumentUploadForm/useDocumentUploadForm.ts` - Custom hook
3. `components/forms/DocumentUploadForm/DocumentUploadFields.tsx` - Form fields
4. `components/forms/DocumentUploadForm/DocumentUploadForm.tsx` - Main component

**Schema Example**:
```typescript
import { z } from 'zod'
import { FILE_EXTENSIONS, DEFAULT_VALUES } from '@/constants'

export const documentUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  file: z.instanceof(File)
    .refine((file) => file.size <= DEFAULT_VALUES.MAX_FILE_SIZE, 'File too large')
    .refine((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      return ext && Object.values(FILE_EXTENSIONS).includes(`.${ext}` as any)
    }, 'Invalid file type'),
  is_featured: z.boolean().default(false),
})
```

**Migration Steps**:
1. Create new form components
2. Keep old `DocumentUpload.tsx` working
3. Test new form thoroughly
4. Replace old component
5. Remove old code

**Checklist**:
- [ ] Schema created
- [ ] Hook created
- [ ] Form component created
- [ ] Old component replaced
- [ ] Upload functionality works
- [ ] Validation works
- [ ] Error handling works

### Step 4.2: Document Edit Form

**Files to Create**:
- `components/forms/DocumentEditForm/documentEditSchema.ts`
- `components/forms/DocumentEditForm/useDocumentEditForm.ts`
- `components/forms/DocumentEditForm/DocumentEditFields.tsx`
- `components/forms/DocumentEditForm/DocumentEditForm.tsx`

**Migration**: Refactor `DocumentEditModal.tsx`

**Checklist**:
- [ ] Form created
- [ ] Modal updated
- [ ] Edit functionality works
- [ ] Validation works

### Step 4.3: Profile Form

**Files to Create**:
- `components/forms/ProfileForm/profileFormSchema.ts`
- `components/forms/ProfileForm/useProfileForm.ts`
- `components/forms/ProfileForm/ProfileFormFields.tsx`
- `components/forms/ProfileForm/ProfileForm.tsx`

**Migration**: Refactor `ProfileForm.tsx`

**Checklist**:
- [ ] Form created
- [ ] Create profile works
- [ ] Edit profile works
- [ ] Password change works
- [ ] Validation works

### Step 4.4: Sign-Up Form

**Files to Create**:
- `components/forms/SignUpForm/signUpFormSchema.ts`
- `components/forms/SignUpForm/useSignUpForm.ts`
- `components/forms/SignUpForm/SignUpFormFields.tsx`
- `components/forms/SignUpForm/SignUpForm.tsx`

**Migration**: Refactor `app/[locale]/signup/page.tsx`

**Checklist**:
- [ ] Form created
- [ ] Sign-up flow works
- [ ] Validation works
- [ ] Google sign-up still works

---

## 🧩 Phase 5: Component Refactoring (Week 4-5)

### Step 5.1: Admin Components (Low Risk)

**Components to Refactor**:
- `AdminDocumentList.tsx` → Use `useDocuments` hook
- `AdminUserManagement.tsx` → Use `useUsers` hook
- `AdminDocumentManagementWithUpload.tsx` → Use hooks
- `AdminStats.tsx` → Use `useStats` hook

**Pattern**:
```typescript
// Before
const [documents, setDocuments] = useState([])
const [loading, setLoading] = useState(false)
useEffect(() => {
  fetchDocuments()
}, [])

// After
const { data: documents = [], isLoading, error } = useDocuments(filters)
```

**Checklist**:
- [ ] All admin components refactored
- [ ] All pages work
- [ ] Filters work
- [ ] Search works

### Step 5.2: Document Components

**Components to Refactor**:
- `DocumentList.tsx`
- `DocumentManagement.tsx`
- `DocumentCard.tsx`
- `DocumentSearch.tsx`

**Checklist**:
- [ ] Components refactored
- [ ] Document listing works
- [ ] Document management works
- [ ] Search/filter works

### Step 5.3: User Components

**Components to Refactor**:
- `UserList.tsx`
- `SubadminManagement.tsx`
- `UserProfileView.tsx`

**Checklist**:
- [ ] Components refactored
- [ ] User listing works
- [ ] Subadmin management works

### Step 5.4: Stats Components

**Components to Refactor**:
- `AdminStats.tsx`
- `StatisticsCards.tsx`

**Checklist**:
- [ ] Components refactored
- [ ] Stats page works
- [ ] Filters work

---

## 🧹 Phase 6: Cleanup & Optimization (Week 5-6)

### Step 6.1: Remove Unused Code

**Tasks**:
- Remove old manual fetch functions
- Remove unused state management
- Remove duplicate code
- Remove commented code

**Checklist**:
- [ ] No unused functions
- [ ] No duplicate code
- [ ] No commented code
- [ ] All functionality still works

### Step 6.2: TypeScript Improvements

**Tasks**:
- Review all `any` types
- Add missing type definitions
- Improve API response types
- Add proper error types

**Checklist**:
- [ ] No `any` types in components
- [ ] All API responses typed
- [ ] All props typed
- [ ] TypeScript compiles without errors

### Step 6.3: Code Organization

**Tasks**:
- Move related components into folders
- Group utilities
- Update imports
- Ensure consistent naming

**Checklist**:
- [ ] Components organized
- [ ] Imports updated
- [ ] No circular dependencies
- [ ] Consistent naming

### Step 6.4: Final Testing

**Test All Flows**:
- [ ] User sign-up flow
- [ ] User login flow
- [ ] Profile creation/editing
- [ ] Document upload
- [ ] Document editing
- [ ] Document deletion
- [ ] Document search/filter
- [ ] Admin user management
- [ ] Admin document management
- [ ] Admin stats
- [ ] Subadmin management
- [ ] Error handling
- [ ] Loading states
- [ ] Performance check

---

## 📊 Migration Strategy

### Incremental Approach

1. **Keep Old Code Working**: Don't delete old code until new code is verified
2. **One Component at a Time**: Migrate one component/feature at a time
3. **Test After Each Migration**: Verify functionality after each change
4. **Remove Old Code**: Only remove old code after new code is fully tested

### Example: Migrating DocumentUpload

1. ✅ Create new form in `components/forms/DocumentUploadForm/`
2. ✅ Keep old `DocumentUpload.tsx` working
3. ✅ Create feature flag or new route to test new form
4. ✅ Test thoroughly
5. ✅ Replace old component with new one
6. ✅ Remove old code

---

## ✅ Testing Checklist

### After Each Phase

- [ ] App compiles without errors
- [ ] No TypeScript errors
- [ ] All pages load
- [ ] Basic functionality works
- [ ] No console errors

### After Phase 1

- [ ] UI components render correctly
- [ ] Icons display properly
- [ ] QueryProvider doesn't break anything

### After Phase 2

- [ ] All services handle errors correctly
- [ ] API calls work as expected

### After Phase 3

- [ ] All hooks return correct data
- [ ] Loading states work
- [ ] Error states work
- [ ] Mutations invalidate queries correctly

### After Phase 4

- [ ] All forms validate correctly
- [ ] All forms submit correctly
- [ ] Error messages display properly

### After Phase 5

- [ ] All pages work
- [ ] All CRUD operations work
- [ ] Filters work
- [ ] Search works

### After Phase 6

- [ ] No unused code
- [ ] No `any` types
- [ ] All imports resolve
- [ ] Performance is acceptable

---

## 🛡️ Risk Mitigation

### Rollback Plan

1. **Keep Old Code**: Store old code in `_old` folder during migration
2. **Feature Flags**: Use feature flags for new components
3. **Git Commits**: Commit after each successful phase
4. **Git Tags**: Tag stable versions

### Common Issues & Solutions

1. **Query Invalidation**: Ensure mutations invalidate related queries
2. **Form State**: Use react-hook-form's form state, not separate useState
3. **Type Errors**: Add proper types gradually
4. **Performance**: Use React Query's caching effectively

---

## 🎯 Success Criteria

- [ ] All forms use react-hook-form
- [ ] All data fetching uses React Query
- [ ] No `any` types in components
- [ ] All icons extracted to separate files
- [ ] All UI components are reusable
- [ ] Code is organized in logical folders
- [ ] No duplicate code
- [ ] All functionality works as before
- [ ] Performance is same or better
- [ ] Code is more maintainable

---

## 📅 Priority Order

### High Priority (Do First)

1. ✅ React Query setup
2. ✅ Service layer
3. ✅ React Query hooks
4. ✅ Document upload form (most complex)
5. ✅ Profile form (most used)

### Medium Priority

1. ✅ Other forms
2. ✅ Admin components
3. ✅ Document components

### Low Priority (Can Do Last)

1. ✅ Icon extraction
2. ✅ Code cleanup
3. ✅ TypeScript improvements

---

## ⏱️ Estimated Timeline

- **Phase 0**: 1 day
- **Phase 1**: 2 days
- **Phase 2**: 4 days
- **Phase 3**: 3 days
- **Phase 4**: 8 days
- **Phase 5**: 7 days
- **Phase 6**: 5 days

**Total**: ~30 days (6 weeks)

---

## 📝 Notes

- Update this document as you progress
- Check off items as you complete them
- Add notes about any issues encountered
- Document any deviations from the plan

---

## 🚦 Current Status

**Current Phase**: Not Started  
**Last Updated**: [Date]  
**Next Steps**: Begin Phase 0

---

## 📚 Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

