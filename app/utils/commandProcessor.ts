/**
 * Enhanced Command Processor with Real LMS Integration
 * Handles special commands like /modules, /progress, /help with live API data
 * Web version adapted from mobile app
 */
import { parseCommand } from './messageProcessor';
import {
  CommandResponse,
  ModuleCommandResponse,
  ProgressCommandResponse,
  CategoryCommandResponse,
  LearningModule,
  ModuleCategory,
  LearningStats,
  UserProgress,
  EnhancedCommandResponse
} from '../types/lms';

// Import the existing web API client
import apiClient from './apiClient';

// Use existing API client functions
async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Use the apiClient directly instead of making manual fetch calls
  const method = (options.method || 'GET').toLowerCase();

  switch (method) {
    case 'get':
      return apiClient.get(endpoint);
    case 'post':
      return apiClient.post(endpoint, options.body ? JSON.parse(options.body as string) : undefined);
    case 'put':
      return apiClient.put(endpoint, options.body ? JSON.parse(options.body as string) : undefined);
    case 'patch':
      return apiClient.patch(endpoint, options.body ? JSON.parse(options.body as string) : undefined);
    case 'delete':
      return apiClient.delete(endpoint);
    default:
      return apiClient.get(endpoint);
  }
}

/**
 * Process chat commands and return appropriate responses with real LMS data
 */
export async function processCommand(text: string): Promise<EnhancedCommandResponse> {
  const command = parseCommand(text);

  if (!command) {
    return {
      type: 'command_response',
      command: text,
      title: 'Unknown Command',
      content: 'Sorry, I don\'t recognize that command. Try `/modules` to see learning modules or `/progress` to check your progress.',
      success: false
    };
  }

  const { command: cmd, args } = command;

  try {
    switch (cmd.toLowerCase()) {
      case 'modules':
      case 'learn':
        return await handleModulesCommand(args);

      case 'progress':
      case 'stats':
        return await handleProgressCommand(args);

      case 'categories':
      case 'cats':
        return await handleCategoriesCommand();

      case 'search':
        return await handleSearchCommand(args);

      case 'help':
        return handleHelpCommand();

      default:
        return {
          type: 'command_response',
          command: cmd,
          title: 'Unknown Command',
          content: `Unknown command: "${cmd}". Available commands:\n\n• \`/modules\` - View learning modules\n• \`/progress\` - Check your progress\n• \`/categories\` - Browse categories\n• \`/search [query]\` - Search modules\n• \`/help\` - Show help`,
          success: false
        };
    }
  } catch (error: any) {
    console.error('Command processing error:', error);
    return {
      type: 'command_response',
      command: cmd,
      title: 'Error',
      content: `Sorry, there was an error processing the command "${cmd}". Please try again later.`,
      success: false
    };
  }
}

/**
 * Handle /modules command with real API data
 */
async function handleModulesCommand(args: string[]): Promise<EnhancedCommandResponse> {
  try {
    // Parse arguments for filtering
    const filterCategory = args.length > 0 ? args.join(' ').toLowerCase() : null;
    const limit = 8; // Show max 8 modules in chat

    // Build query parameters
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    if (filterCategory) {
      params.append('search', filterCategory);
    } else {
      params.append('featured', 'true'); // Show featured if no filter
    }

    // Fetch modules from API
    const response = await apiCall(`/lms/modules?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch modules');
    }

    const responseData = response.data as any;
    const modules: LearningModule[] = Array.isArray(responseData.data) ? responseData.data :
                                     Array.isArray(responseData) ? responseData : [];
    const totalCount = responseData.pagination?.total || modules.length;

    // Create structured response
    const commandResponse: ModuleCommandResponse = {
      type: 'modules',
      title: filterCategory ? `Modules: "${filterCategory}"` : 'Featured Learning Modules',
      description: filterCategory
        ? `Found ${modules.length} modules matching "${filterCategory}"`
        : `Here are our ${modules.length} featured learning modules`,
      modules,
      total_count: totalCount,
      search_query: filterCategory || undefined
    };

    // Create human-readable content
    const content = modules.length > 0
      ? `${commandResponse.description}:\n\n${
          modules.map(module =>
            `**${module.title}**\n` +
            `📚 ${module.category?.name || 'General'} • ${capitalizeFirst(module.difficulty_level)}\n` +
            `⏱️ ${module.estimated_duration_minutes} min\n` +
            `${module.description}\n`
          ).join('\n')
        }\n💡 *Click any module card below to learn more!*`
      : `No modules found${filterCategory ? ` for "${filterCategory}"` : ''}. Try browsing all categories or searching for different terms.`;

    return {
      type: 'command_response',
      command: 'modules',
      title: commandResponse.title,
      content,
      success: true,
      data: commandResponse
    };
  } catch (error: any) {
    console.error('Modules command error:', error);
    return {
      type: 'command_response',
      command: 'modules',
      title: 'Error Loading Modules',
      content: 'Sorry, I couldn\'t load the learning modules right now. Please check your connection and try again.',
      success: false
    };
  }
}

/**
 * Handle /progress command with real user data
 */
async function handleProgressCommand(args: string[]): Promise<EnhancedCommandResponse> {
  try {
    // Fetch user progress and stats
    const [statsResponse, progressResponse] = await Promise.all([
      apiCall('/lms/stats'),
      apiCall('/lms/progress?limit=5') // Recent progress
    ]);

    if (!statsResponse.success) {
      throw new Error(statsResponse.error || 'Failed to fetch learning stats');
    }

    const statsData = statsResponse.data as any;
    const progressData = progressResponse.data as any;
    const recentProgress: UserProgress[] = progressResponse.success ?
      (Array.isArray(progressData?.data) ? progressData.data :
       Array.isArray(progressData) ? progressData : []) : [];

    // Transform API response to our expected format
    const stats: LearningStats = {
      total_modules: statsData.overview?.total_modules_started || 0,
      completed_modules: statsData.overview?.completed_modules || 0,
      in_progress_modules: statsData.overview?.in_progress_modules || 0,
      bookmarked_modules: statsData.overview?.bookmarked_modules || 0,
      total_time_spent_minutes: statsData.overview?.total_time_spent_minutes || 0,
      completion_rate: statsData.overview?.completion_rate || 0,
      current_streak_days: statsData.overview?.current_streak_days || 0,
      longest_streak_days: statsData.overview?.current_streak_days || 0, // Use current as fallback
      recent_activity: statsData.recent_activity || [],
      favorite_categories: statsData.categories || []
    };

    // Create structured response
    const commandResponse: ProgressCommandResponse = {
      type: 'progress',
      title: 'Your Learning Progress',
      description: `You've completed ${stats.completed_modules || 0} out of ${stats.total_modules || 0} modules`,
      stats,
      recent_modules: recentProgress
    };

    // Create human-readable content
    const completionRate = Math.round(stats.completion_rate || 0);
    const hoursSpent = Math.round((stats.total_time_spent_minutes || 0) / 60 * 10) / 10;

    const content = `## Your Learning Progress 📊\n\n` +
      `**Overall Completion:** ${completionRate}% (${stats.completed_modules || 0}/${stats.total_modules || 0} modules)\n\n` +
      `**Time Invested:** ${hoursSpent} hours\n` +
      `**Learning Streak:** ${stats.current_streak_days || 0} days 🔥\n\n` +
      (recentProgress.length > 0 ?
        `### Recent Activity\n${
          recentProgress.map(progress =>
            `• ${capitalizeFirst(progress.status.replace('_', ' '))} "${progress.module?.title || 'Module'}" (${progress.progress_percentage}%)`
          ).join('\n')
        }\n\n` : '') +
      `**Quick Stats:**\n` +
      `• In Progress: ${stats.in_progress_modules || 0} modules\n` +
      `• Bookmarked: ${stats.bookmarked_modules || 0} modules\n\n` +
      `*Keep up the excellent work! 🚀*`;

    return {
      type: 'command_response',
      command: 'progress',
      title: commandResponse.title,
      content,
      success: true,
      data: commandResponse
    };
  } catch (error: any) {
    console.error('Progress command error:', error);
    return {
      type: 'command_response',
      command: 'progress',
      title: 'Error Loading Progress',
      content: 'Sorry, I couldn\'t load your progress right now. Please check your connection and try again.',
      success: false
    };
  }
}

/**
 * Handle /categories command
 */
async function handleCategoriesCommand(): Promise<EnhancedCommandResponse> {
  try {
    const response = await apiCall('/lms/categories');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch categories');
    }

    const responseData = response.data as any;
    const categories: ModuleCategory[] = Array.isArray(responseData.data) ? responseData.data :
                                        Array.isArray(responseData) ? responseData : [];

    // Create structured response
    const commandResponse: CategoryCommandResponse = {
      type: 'categories',
      title: 'Learning Categories',
      description: `Browse ${categories.length} learning categories`,
      categories
    };

    // Create human-readable content
    const content = categories.length > 0
      ? `Here are all available learning categories:\n\n${
          categories.map(category =>
            `**${category.name}**\n` +
            `${category.description || 'Explore modules in this category'}\n`
          ).join('\n')
        }\n💡 *Use \`/modules [category]\` to see modules in a specific category!*`
      : 'No categories available at the moment. Please check back later.';

    return {
      type: 'command_response',
      command: 'categories',
      title: commandResponse.title,
      content,
      success: true,
      data: commandResponse
    };
  } catch (error: any) {
    console.error('Categories command error:', error);
    return {
      type: 'command_response',
      command: 'categories',
      title: 'Error Loading Categories',
      content: 'Sorry, I couldn\'t load the categories right now. Please check your connection and try again.',
      success: false
    };
  }
}

/**
 * Handle /search command
 */
async function handleSearchCommand(args: string[]): Promise<EnhancedCommandResponse> {
  const query = args.join(' ').trim();

  if (!query) {
    return {
      type: 'command_response',
      command: 'search',
      title: 'Search Modules',
      content: 'Please provide a search term. Example: `/search digital skills`',
      success: false
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('limit', '6');

    const response = await apiCall(`/lms/modules?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Search failed');
    }

    const responseData = response.data as any;
    const modules: LearningModule[] = Array.isArray(responseData.data) ? responseData.data :
                                     Array.isArray(responseData) ? responseData : [];

    // Create structured response (reuse ModuleCommandResponse)
    const commandResponse: ModuleCommandResponse = {
      type: 'modules',
      title: `Search Results: "${query}"`,
      description: `Found ${modules.length} modules matching "${query}"`,
      modules,
      search_query: query
    };

    const content = modules.length > 0
      ? `${commandResponse.description}:\n\n${
          modules.map(module =>
            `**${module.title}**\n` +
            `📚 ${module.category?.name || 'General'} • ${capitalizeFirst(module.difficulty_level)}\n` +
            `⏱️ ${module.estimated_duration_minutes} min\n` +
            `${module.description}\n`
          ).join('\n')
        }\n💡 *Click any module card below to learn more!*`
      : `No modules found for "${query}". Try different search terms or browse categories.`;

    return {
      type: 'command_response',
      command: 'search',
      title: commandResponse.title,
      content,
      success: true,
      data: commandResponse
    };
  } catch (error: any) {
    console.error('Search command error:', error);
    return {
      type: 'command_response',
      command: 'search',
      title: 'Search Error',
      content: `Sorry, I couldn't search for "${query}" right now. Please try again later.`,
      success: false
    };
  }
}

/**
 * Handle /help command
 */
function handleHelpCommand(): EnhancedCommandResponse {
  const content = `## Available Commands 🤖\n\n` +
    `**Learning Commands:**\n` +
    `• \`/modules\` - Browse featured learning modules\n` +
    `• \`/modules [category]\` - Filter modules by category\n` +
    `• \`/search [query]\` - Search for specific modules\n` +
    `• \`/categories\` - View all learning categories\n` +
    `• \`/progress\` - View your learning progress and stats\n\n` +
    `**General Commands:**\n` +
    `• \`/help\` - Show this help message\n\n` +
    `**Tips:**\n` +
    `• You can also ask questions naturally, like "What modules are available?"\n` +
    `• Use the Quick Actions menu (⌘K or /) for shortcuts\n` +
    `• Click on module cards to view details and start learning\n\n` +
    `*Happy learning! 🎓*`;

  return {
    type: 'command_response',
    command: 'help',
    title: 'Command Help',
    content,
    success: true
  };
}

/**
 * Check if a command is available
 */
export function isValidCommand(command: string): boolean {
  const validCommands = ['modules', 'learn', 'progress', 'stats', 'categories', 'cats', 'search', 'help'];
  return validCommands.includes(command.toLowerCase());
}

/**
 * Get command suggestions based on input
 */
export function getCommandSuggestions(input: string): string[] {
  const commands = [
    '/modules - Browse learning modules',
    '/progress - Check your progress',
    '/categories - View all categories',
    '/search [query] - Search modules',
    '/help - Show available commands'
  ];

  if (!input || input === '/') {
    return commands;
  }

  const query = input.toLowerCase().replace('/', '');
  return commands.filter(cmd =>
    cmd.toLowerCase().includes(query)
  );
}

/**
 * Utility function to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export the types for backward compatibility
export type { EnhancedCommandResponse as CommandResponse };