// import TreeNode from "@/features/locationTypes/components/TreeNode.jsx";

// export default function TreeView({
//   types,
//   onUpdate,
//   flag,
//   canUpdate,
//   canDelete,
// }) {
//   // const [read , setRead] = useState( flag == false? true :false )
//   // console.log(flag, "flag");
//   console.log("flag:", flag);
//   console.log("types:", types);
//   // console.log(types, "types")
//   const buildTree = () => {
//     const tree = [];
//     const map = {};

//     types.forEach((type) => {
//       type.children = [];
//       map[type.id] = type;
//     });

//     types.forEach((type) => {
//       if (type.parent_id) {
//         map[type.parent_id]?.children.push(type);
//       } else {
//         tree.push(type);
//       }
//     });

//     return tree;
//   };

//   const tree = buildTree();

//   console.log(tree, "tree ");
//   return (
//     <div className="space-y-2">
//       {tree.map((type) => (
//         <TreeNode
//           key={type.id}
//           type={type}
//           onUpdate={onUpdate}
//           allTypes={types}
//           read={flag}
//           canUpdate={canUpdate}
//           canDelete={canDelete}
//         />
//       ))}
//     </div>
//   );
// }

import TreeNode from "./TreeNode";

export default function TreeView({
  types,
  onUpdate,
  flag,
  canUpdate,
  canDelete,
}) {
  // const [read , setRead] = useState( flag == false? true :false )
  // console.log(flag, "flag");
  console.log("flag:", flag);
  console.log("types:", types);
  // console.log(types, "types")
  // const buildTree = () => {
  //   const tree = [];
  //   const map = {};

  //   types.forEach((type) => {
  //     type.children = [];
  //     map[type.id] = type;
  //   });

  //   types.forEach((type) => {
  //     if (type.parent_id) {
  //       map[type.parent_id]?. children.push(type);
  //     } else {
  //       tree.push(type);
  //     }
  //   });

  //   return tree;
  // };

  const buildTree = () => {
    const tree = [];
    const map = {};

    // 1. Initialize map
    types.forEach((type) => {
      // Create a shallow copy to avoid mutating props directly if needed
      // and ensure children array exists
      map[type.id] = { ...type, children: [] };
    });

    // 2. Connect nodes
    types.forEach((type) => {
      // Check if parent exists in our map
      const parent = map[type.parent_id];

      // Logic:
      // 1. If parent_id exists AND the parent is found in the map...
      // 2. AND we prevent immediate circular reference (A is parent of B, B is parent of A)
      if (type.parent_id && parent && parent.parent_id !== type.id) {
        parent.children.push(map[type.id]);
      } else {
        // If no parent_id, OR parent not found, OR circular dependency detected:
        // Add to root level
        tree.push(map[type.id]);
      }
    });

    return tree;
  };

  const tree = buildTree();
  console.log(tree, "tree");
  return (
    <div className="space-y-2">
      {tree.map((type) => (
        <TreeNode
          key={type.id}
          type={type}
          onUpdate={onUpdate}
          allTypes={types}
          read={flag}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
