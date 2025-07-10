// Plugin for adding empty space before component property names
// Analyzes selected components and adds empty space only to property names

// Invisible large space (Em Space - U+2003)
const EMPTY_SPACE = '\u2003';

// Function to add empty space at the beginning of string if it's not already there
function addEmptySpaceToName(name: string): string {
  // Check if name already starts with invisible space
  if (name.startsWith(EMPTY_SPACE)) {
    return name;
  }
  return EMPTY_SPACE + name;
}

// Function to get all object keys
function getObjectKeys(obj: Record<string, any>): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
}

// Function to extract clean property name (without suffix #0:0)
function getCleanPropertyName(propertyKey: string): string {
  // Remove suffix like #0:0 from property name
  const hashIndex = propertyKey.indexOf('#');
  if (hashIndex !== -1) {
    return propertyKey.substring(0, hashIndex);
  }
  return propertyKey;
}

// Function to process component properties
function processComponentProperties(component: ComponentNode): number {
  let processedCount = 0;
  
  // Process component properties
  if (component.componentPropertyDefinitions) {
    const propertyDefinitions = component.componentPropertyDefinitions;
    const propertyKeys = getObjectKeys(propertyDefinitions);
    
    for (const propertyKey of propertyKeys) {
      const propertyDefinition = propertyDefinitions[propertyKey];
      
      // Get clean property name (without suffix)
      const cleanPropertyName = getCleanPropertyName(propertyKey);
      const newPropertyName = addEmptySpaceToName(cleanPropertyName);
      
      if (cleanPropertyName !== newPropertyName) {
        try {
          // Pass only property name, don't touch defaultValue
          const updatedPropertyId = component.editComponentProperty(propertyKey, {
            name: newPropertyName
          });
          
          console.log(`Property "${cleanPropertyName}" -> "${newPropertyName}" (${propertyDefinition.type}) in component "${component.name}"`);
          processedCount++;
        } catch (error) {
          console.log(`Error updating property "${cleanPropertyName}": ${error}`);
        }
      }
    }
  }
  
  return processedCount;
}

// Function to process component set properties
function processComponentSetProperties(componentSet: ComponentSetNode): number {
  let processedCount = 0;
  
  // Process component set properties
  if (componentSet.componentPropertyDefinitions) {
    const propertyDefinitions = componentSet.componentPropertyDefinitions;
    const propertyKeys = getObjectKeys(propertyDefinitions);
    
    for (const propertyKey of propertyKeys) {
      const propertyDefinition = propertyDefinitions[propertyKey];
      
      // Get clean property name (without suffix)
      const cleanPropertyName = getCleanPropertyName(propertyKey);
      const newPropertyName = addEmptySpaceToName(cleanPropertyName);
      
      if (cleanPropertyName !== newPropertyName) {
        try {
          // Pass only property name, don't touch defaultValue
          const updatedPropertyId = componentSet.editComponentProperty(propertyKey, {
            name: newPropertyName
          });
          
          console.log(`Property "${cleanPropertyName}" -> "${newPropertyName}" (${propertyDefinition.type}) in component set "${componentSet.name}"`);
          processedCount++;
        } catch (error) {
          console.log(`Error updating property "${cleanPropertyName}": ${error}`);
        }
      }
    }
  }
  
  return processedCount;
}

// Function to process single component
function processComponent(component: ComponentNode): number {
  // Process only component properties, not the name
  return processComponentProperties(component);
}

// Function to process component instances
function processComponentInstance(instance: InstanceNode): number {
  // Instances inherit from main component
  // Process main component
  const mainComponent = instance.mainComponent;
  if (mainComponent) {
    console.log(`Processing main component for instance "${instance.name}"`);
    return processComponent(mainComponent);
  }
  return 0;
}

// Function to process component sets
function processComponentSet(componentSet: ComponentSetNode): number {
  // Process only component set properties, not name and not individual variants
  return processComponentSetProperties(componentSet);
}

// Main plugin function
function addEmptySpaceToProperties(): void {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('Please select components to process');
    figma.closePlugin();
    return;
  }
  
  let totalProcessedCount = 0;
  let skippedCount = 0;
  
  // Process each selected element
  for (const node of selection) {
    switch (node.type) {
      case 'COMPONENT':
        totalProcessedCount += processComponent(node as ComponentNode);
        break;
        
      case 'INSTANCE':
        totalProcessedCount += processComponentInstance(node as InstanceNode);
        break;
        
      case 'COMPONENT_SET':
        totalProcessedCount += processComponentSet(node as ComponentSetNode);
        break;
        
      default:
        console.log(`Skipped element type ${node.type}: ${node.name}`);
        skippedCount++;
        break;
    }
  }
  
  // Show result
  if (totalProcessedCount > 0) {
    figma.notify(`Processed ${totalProcessedCount} properties${skippedCount > 0 ? `, skipped ${skippedCount} elements` : ''}`);
  } else {
    figma.notify('No properties found to process. Select components with properties.');
  }
  
  figma.closePlugin();
}

// Run plugin immediately
addEmptySpaceToProperties();
