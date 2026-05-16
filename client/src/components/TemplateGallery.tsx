import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, TrendingUp, AlertCircle, Cpu } from "lucide-react";
import { useLocation } from "wouter";

export function TemplateGallery() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const { data: templates, isLoading } = trpc.templates.list.useQuery();
  const createFromTemplate = trpc.templates.createFromTemplate.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        navigate("/workflows");
      }
    },
  });

  const filteredTemplates = templates?.filter((template) => {
    if (selectedCategory && template.category !== selectedCategory) return false;
    if (selectedDifficulty && template.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const categories = Array.from(new Set(templates?.map((t) => t.category) || []));
  const difficulties = ["beginner", "intermediate", "advanced"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Caso 1":
        return <Zap className="w-4 h-4" />;
      case "Caso 2":
        return <TrendingUp className="w-4 h-4" />;
      case "Caso 3":
        return <AlertCircle className="w-4 h-4" />;
      case "Caso 4":
        return <Cpu className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Workflow Templates</h2>
        <p className="text-gray-600">
          Choose from pre-built templates to quickly create workflows for common use cases.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-2"
              >
                {getCategoryIcon(category)}
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Difficulty</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDifficulty === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(null)}
            >
              All
            </Button>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className="capitalize"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates?.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="gap-1">
                    {getCategoryIcon(template.category)}
                    {template.category}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Nodes ({template.nodes.length})
                    </p>
                    <p className="text-xs text-gray-500">
                      {template.nodes.map((n: any) => n.type).join(", ")}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      const name = `${template.name} - ${new Date().toLocaleString()}`;
                      createFromTemplate.mutate({
                        templateId: template.id,
                        name,
                      });
                    }}
                    disabled={createFromTemplate.isPending}
                    className="w-full"
                  >
                    {createFromTemplate.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Use Template"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredTemplates?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No templates found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
