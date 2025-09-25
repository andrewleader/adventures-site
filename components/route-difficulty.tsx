import { Route } from '@/tina/__generated__/types';

interface RouteDifficultyProps {
  route: Route;
  className?: string;
}

export function getRouteDifficultyText(route: Route): string {
  if (!route.classRating) return 'Unspecified';
  
  if (route.classRating === 'class5' && route.ydsRating) {
    const subRating = route.ydsSubRating && route.ydsSubRating !== 'none' && route.ydsSubRating.trim() !== '' 
      ? route.ydsSubRating 
      : '';
    return `5.${route.ydsRating}${subRating}`;
  }
  
  return route.classRating.replace('class', 'Class ');
}

export function RouteDifficulty({ route, className = '' }: RouteDifficultyProps) {
  const difficultyText = getRouteDifficultyText(route);
  
  return (
    <span className={className}>
      🧗 {difficultyText}
    </span>
  );
}