// Плагин для добавления пустого пробела перед названиями пропертисов компонентов
// Анализирует выделенные компоненты и добавляет пустой пробел только в названия пропертисов

// Невидимый большой пробел (Em Space - U+2003)
const EMPTY_SPACE = '\u2003';

// Функция для добавления пустого пробела в начало строки, если его там нет
function addEmptySpaceToName(name: string): string {
  // Проверяем, начинается ли название уже с невидимого пробела
  if (name.startsWith(EMPTY_SPACE)) {
    return name;
  }
  return EMPTY_SPACE + name;
}

// Функция для получения всех ключей объекта
function getObjectKeys(obj: Record<string, any>): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
}

// Функция для извлечения чистого названия пропертиса (без суффикса #0:0)
function getCleanPropertyName(propertyKey: string): string {
  // Убираем суффикс вида #0:0 из названия пропертиса
  const hashIndex = propertyKey.indexOf('#');
  if (hashIndex !== -1) {
    return propertyKey.substring(0, hashIndex);
  }
  return propertyKey;
}

// Функция для обработки пропертисов компонента
function processComponentProperties(component: ComponentNode): number {
  let processedCount = 0;
  
  // Обрабатываем пропертисы компонента
  if (component.componentPropertyDefinitions) {
    const propertyDefinitions = component.componentPropertyDefinitions;
    const propertyKeys = getObjectKeys(propertyDefinitions);
    
    for (const propertyKey of propertyKeys) {
      const propertyDefinition = propertyDefinitions[propertyKey];
      
      // Получаем чистое название пропертиса (без суффикса)
      const cleanPropertyName = getCleanPropertyName(propertyKey);
      const newPropertyName = addEmptySpaceToName(cleanPropertyName);
      
      if (cleanPropertyName !== newPropertyName) {
        try {
          // Передаем только название пропертиса, не трогаем defaultValue
          const updatedPropertyId = component.editComponentProperty(propertyKey, {
            name: newPropertyName
          });
          
          console.log(`Пропертис "${cleanPropertyName}" -> "${newPropertyName}" (${propertyDefinition.type}) в компоненте "${component.name}"`);
          processedCount++;
        } catch (error) {
          console.log(`Ошибка при обновлении пропертиса "${cleanPropertyName}": ${error}`);
        }
      }
    }
  }
  
  return processedCount;
}

// Функция для обработки пропертисов компонент сета
function processComponentSetProperties(componentSet: ComponentSetNode): number {
  let processedCount = 0;
  
  // Обрабатываем пропертисы компонент сета
  if (componentSet.componentPropertyDefinitions) {
    const propertyDefinitions = componentSet.componentPropertyDefinitions;
    const propertyKeys = getObjectKeys(propertyDefinitions);
    
    for (const propertyKey of propertyKeys) {
      const propertyDefinition = propertyDefinitions[propertyKey];
      
      // Получаем чистое название пропертиса (без суффикса)
      const cleanPropertyName = getCleanPropertyName(propertyKey);
      const newPropertyName = addEmptySpaceToName(cleanPropertyName);
      
      if (cleanPropertyName !== newPropertyName) {
        try {
          // Передаем только название пропертиса, не трогаем defaultValue
          const updatedPropertyId = componentSet.editComponentProperty(propertyKey, {
            name: newPropertyName
          });
          
          console.log(`Пропертис "${cleanPropertyName}" -> "${newPropertyName}" (${propertyDefinition.type}) в компонент сете "${componentSet.name}"`);
          processedCount++;
        } catch (error) {
          console.log(`Ошибка при обновлении пропертиса "${cleanPropertyName}": ${error}`);
        }
      }
    }
  }
  
  return processedCount;
}

// Функция для обработки одного компонента
function processComponent(component: ComponentNode): number {
  // Обрабатываем только пропертисы компонента, не название
  return processComponentProperties(component);
}

// Функция для обработки экземпляров компонентов
function processComponentInstance(instance: InstanceNode): number {
  // Экземпляры наследуют от основного компонента
  // Обрабатываем основной компонент
  const mainComponent = instance.mainComponent;
  if (mainComponent) {
    console.log(`Обрабатываю основной компонент для экземпляра "${instance.name}"`);
    return processComponent(mainComponent);
  }
  return 0;
}

// Функция для обработки компонент сетов
function processComponentSet(componentSet: ComponentSetNode): number {
  // Обрабатываем только пропертисы компонент сета, не название и не отдельные варианты
  return processComponentSetProperties(componentSet);
}

// Основная функция плагина
function addEmptySpaceToProperties(): void {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('Пожалуйста, выберите компоненты для обработки');
    figma.closePlugin();
    return;
  }
  
  let totalProcessedCount = 0;
  let skippedCount = 0;
  
  // Обрабатываем каждый выделенный элемент
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
        console.log(`Пропущен элемент типа ${node.type}: ${node.name}`);
        skippedCount++;
        break;
    }
  }
  
  // Показываем результат
  if (totalProcessedCount > 0) {
    figma.notify(`Обработано пропертисов: ${totalProcessedCount}${skippedCount > 0 ? `, пропущено элементов: ${skippedCount}` : ''}`);
  } else {
    figma.notify('Не найдено пропертисов для обработки. Выберите компоненты с пропертисами.');
  }
  
  figma.closePlugin();
}

// Запускаем плагин сразу
addEmptySpaceToProperties();
