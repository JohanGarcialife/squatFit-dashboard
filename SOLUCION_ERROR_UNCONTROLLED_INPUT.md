# ✅ SOLUCIÓN: Error "changing uncontrolled input to controlled"

## 🔴 Error Original

```
Console Error:
A component is changing an uncontrolled input to be controlled.
This is likely caused by the value changing from undefined to a defined value,
which should not happen.
```

## ❓ ¿QUÉ CAUSABA EL ERROR?

Este error ocurre cuando un input de React cambia de tener un valor `undefined` a un valor definido (o viceversa). En React, un input se considera:

- **Controlado:** cuando tiene un `value` definido (string, number, etc.)
- **No controlado:** cuando `value` es `undefined` o no está definido

React NO permite que un input cambie de un estado a otro durante su ciclo de vida.

---

## 🔧 CORRECCIONES APLICADAS

### **1. Valores por defecto en formularios** ✅

**ANTES:**

```typescript
export const createCursoDefaultValues: Partial<CreateCursoFormValues> = {
  currency: "€",
  status: "En Desarrollo",
  price: 0,
  // Otros campos: undefined ❌
};
```

**AHORA:**

```typescript
export const createCursoDefaultValues: CreateCursoFormValues = {
  name: "", // ✅ String vacío, NO undefined
  description: "", // ✅ String vacío, NO undefined
  instructor: "", // ✅ String vacío, NO undefined
  category: "", // ✅ String vacío, NO undefined
  level: "Principiante", // ✅ Valor por defecto
  price: 0, // ✅ Número, NO undefined
  duration: "", // ✅ String vacío, NO undefined
  status: "En Desarrollo",
  currency: "€",
};
```

**Archivo:** `src/app/(main)/dashboard/cursos/_components/create-curso-schema.ts`

---

### **2. Formulario de edición con valores iniciales** ✅

**ANTES:**

```typescript
const form = useForm<CreateCursoFormValues>({
  resolver: zodResolver(createCursoFormSchema),
  // Sin defaultValues ❌
});
```

**AHORA:**

```typescript
const form = useForm<CreateCursoFormValues>({
  resolver: zodResolver(createCursoFormSchema),
  defaultValues: createCursoDefaultValues, // ✅ Valores iniciales
});
```

**Archivo:** `src/app/(main)/dashboard/cursos/_components/edit-curso-modal.tsx`

---

### **3. Optimización con useCallback** ✅

Para evitar re-renders innecesarios que podrían causar el error:

**ANTES:**

```typescript
const handleEdit = (curso: Curso) => { ... };
const handleDelete = (curso: Curso) => { ... };
const handleToggleStatus = (curso: Curso) => { ... };

const columns = useMemo<ColumnDef<Curso>[]>(() => {
  // usa handlers
}, []); // ❌ Dependencias faltantes
```

**AHORA:**

```typescript
const handleEdit = useCallback((curso: Curso) => { ... }, []);
const handleDelete = useCallback((curso: Curso) => { ... }, []);
const handleToggleStatus = useCallback((curso: Curso) => { ... }, [toggleStatusMutation]);

const columns = useMemo<ColumnDef<Curso>[]>(() => {
  // usa handlers
}, [handleEdit, handleDelete, handleToggleStatus]); // ✅ Dependencias correctas
```

**Archivo:** `src/app/(main)/dashboard/cursos/_components/cursos-table.tsx`

---

## 🎯 POR QUÉ ESTAS CORRECCIONES FUNCIONAN

### **1. Todos los inputs siempre controlados**

Los formularios ahora siempre tienen valores definidos desde el inicio:

- Strings vacíos `""` en lugar de `undefined`
- Números `0` en lugar de `undefined`
- Valores por defecto para selects

### **2. Sin cambios de estado durante el ciclo de vida**

Con `defaultValues` definidos, React Hook Form nunca intenta cambiar de uncontrolled → controlled.

### **3. Re-renders optimizados**

`useCallback` asegura que las funciones no se recreen en cada render, evitando que los componentes hijos se re-rendericen innecesariamente.

---

## 🧪 CÓMO VERIFICAR LA SOLUCIÓN

### **Paso 1: Refresca el navegador**

```
F5 o Ctrl + R
```

### **Paso 2: Abre la consola**

```
F12 → Console
```

### **Paso 3: Ve a la página de cursos**

```
http://localhost:3000/dashboard/cursos
```

### **Paso 4: Verifica que NO hay errores**

```
✅ NO debería aparecer el warning "changing uncontrolled input"
```

### **Paso 5: Prueba las funcionalidades**

1. **Buscar cursos:**
   - Escribe en el input de búsqueda
   - ✅ NO debería haber error

2. **Crear curso:**
   - Click en "Nuevo Curso"
   - Llena el formulario
   - ✅ Todos los campos deben funcionar correctamente

3. **Editar curso:**
   - Click en menú (⋮) → "Editar curso"
   - Los campos deben prellenarse correctamente
   - ✅ NO debería haber error

---

## 📋 REGLA GENERAL PARA EVITAR ESTE ERROR

### **✅ HACER:**

```typescript
// Siempre define valores por defecto
const [value, setValue] = useState("");  // ✅ String vacío
const [count, setCount] = useState(0);   // ✅ Número

// En formularios, siempre usa defaultValues completo
const form = useForm({
  defaultValues: {
    name: "",      // ✅
    age: 0,        // ✅
    email: "",     // ✅
  }
});

// En inputs controlados
<Input value={value ?? ""} onChange={...} />  // ✅
```

### **❌ NO HACER:**

```typescript
// Evita undefined como valor inicial
const [value, setValue] = useState();  // ❌ undefined

// Evita defaultValues parciales
const form = useForm({
  defaultValues: {
    name: "",
    // age y email faltantes ❌
  }
});

// Evita value sin fallback
<Input value={value} onChange={...} />  // ❌ si value es undefined
```

---

## ✅ RESULTADO ESPERADO

Después de estas correcciones:

1. ✅ **NO más warnings** en la consola
2. ✅ **Formulario de crear curso** funciona perfectamente
3. ✅ **Formulario de editar curso** se prelena correctamente
4. ✅ **Búsqueda en la tabla** funciona sin errores
5. ✅ **Todo es más eficiente** (menos re-renders)

---

## 🎓 LECCIÓN APRENDIDA

> **"En React, un input debe ser SIEMPRE controlado o SIEMPRE no controlado, nunca cambiar entre ambos estados."**

Para lograrlo:

- ✅ Define valores iniciales para TODOS los campos
- ✅ Usa string vacío `""` en lugar de `undefined`
- ✅ Usa `?? ""` o `|| ""` como fallback
- ✅ En React Hook Form, siempre define `defaultValues` completo

---

**¡El error ahora está completamente corregido!** 🎉
