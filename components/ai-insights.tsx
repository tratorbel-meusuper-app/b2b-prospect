"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, Target, Clock, DollarSign, Users, BarChart3 } from "lucide-react"

interface AIInsightsProps {
  companies: any[]
}

export function AIInsights({ companies }: AIInsightsProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  useEffect(() => {
    if (companies.length > 0) {
      generateInsights()
    }
  }, [companies])

  const generateInsights = async () => {
    setLoading(true)
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const totalCompanies = companies.length
      const activeCompanies = companies.filter((c) => c.situacao_cadastral?.situacao_atual === "ATIVA").length
      const highScoreCompanies = companies.filter((c) => (c.ai_score || 0) > 70).length
      const avgScore = companies.reduce((sum, c) => sum + (c.ai_score || 0), 0) / totalCompanies

      const insights = {
        overview: {
          totalCompanies,
          activeCompanies,
          highScoreCompanies,
          avgScore: Math.round(avgScore),
          conversionPrediction: Math.round(highScoreCompanies * 0.15), // 15% conversion rate
          estimatedRevenue: highScoreCompanies * 25000, // R$ 25k average deal
        },
        trends: [
          {
            title: "Empresas Ativas",
            value: `${Math.round((activeCompanies / totalCompanies) * 100)}%`,
            trend: "up",
            description: "Percentual de empresas com situação ativa",
          },
          {
            title: "Score Médio IA",
            value: Math.round(avgScore),
            trend: avgScore > 50 ? "up" : "down",
            description: "Score médio de potencial de conversão",
          },
          {
            title: "Leads Qualificados",
            value: highScoreCompanies,
            trend: "up",
            description: "Empresas com score acima de 70",
          },
        ],
        recommendations: [
          {
            priority: "high",
            title: "Priorizar Leads de Alto Score",
            description: `${highScoreCompanies} empresas têm score acima de 70. Foque nestes leads primeiro.`,
            action: "Ver Leads Prioritários",
          },
          {
            priority: "medium",
            title: "Segmentar por Região",
            description: "Concentre esforços nas regiões com maior densidade de leads qualificados.",
            action: "Analisar Mapa",
          },
          {
            priority: "low",
            title: "Campanhas de Reativação",
            description: `${totalCompanies - activeCompanies} empresas inativas podem ser reativadas.`,
            action: "Criar Campanha",
          },
        ],
        predictions: {
          nextWeek: {
            newLeads: Math.round(totalCompanies * 0.1),
            conversions: Math.round(highScoreCompanies * 0.05),
            revenue: Math.round(highScoreCompanies * 0.05 * 25000),
          },
          nextMonth: {
            newLeads: Math.round(totalCompanies * 0.4),
            conversions: Math.round(highScoreCompanies * 0.15),
            revenue: Math.round(highScoreCompanies * 0.15 * 25000),
          },
        },
      }

      setInsights(insights)
    } catch (error) {
      console.error("Error generating insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeCompany = async (company: any) => {
    setSelectedCompany(company)
    // Simulate individual company analysis
    const analysis = {
      score: company.ai_score || Math.floor(Math.random() * 100),
      factors: [
        {
          name: "Situação Cadastral",
          impact: company.situacao_cadastral?.situacao_atual === "ATIVA" ? 30 : -20,
          positive: company.situacao_cadastral?.situacao_atual === "ATIVA",
        },
        { name: "Nome Fantasia", impact: company.nome_fantasia ? 10 : -5, positive: !!company.nome_fantasia },
        {
          name: "Tipo de Empresa",
          impact: company.razao_social?.includes("LTDA") ? 15 : 0,
          positive: company.razao_social?.includes("LTDA"),
        },
        { name: "Histórico", impact: Math.floor(Math.random() * 20) - 10, positive: Math.random() > 0.5 },
      ],
      recommendations: [
        "Abordar via telefone no horário comercial",
        "Mencionar nome fantasia na apresentação",
        "Focar em soluções para empresas do segmento",
        "Preparar proposta personalizada",
      ],
      bestContactTime: "14:00 - 16:00",
      estimatedValue: Math.floor(Math.random() * 50000) + 10000,
      conversionProbability: Math.floor(Math.random() * 40) + 30,
    }

    setSelectedCompany({ ...company, analysis })
  }

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
        <CardContent className="text-center py-12">
          <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Analisando dados com IA...</h3>
          <p className="text-slate-600">Gerando insights preditivos para seus leads</p>
          <Progress value={75} className="w-64 mx-auto mt-4" />
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
        <CardContent className="text-center py-12">
          <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum dado para análise</h3>
          <p className="text-slate-600">Execute uma busca para gerar insights com IA</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insights de IA</h2>
          <p className="text-slate-600">Análise preditiva e recomendações inteligentes</p>
        </div>
        <Button onClick={generateInsights} disabled={loading}>
          <Brain className="w-4 h-4 mr-2" />
          Atualizar Análise
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="individual">Análise Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total de Empresas</p>
                    <p className="text-2xl font-bold text-blue-900">{insights.overview.totalCompanies}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Leads Qualificados</p>
                    <p className="text-2xl font-bold text-green-900">{insights.overview.highScoreCompanies}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Conversões Previstas</p>
                    <p className="text-2xl font-bold text-purple-900">{insights.overview.conversionPrediction}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Receita Estimada</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      R$ {insights.overview.estimatedRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Recomendações da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        rec.priority === "high"
                          ? "bg-red-500"
                          : rec.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{rec.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.trends.map((trend: any, index: number) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900">{trend.title}</h3>
                    <TrendingUp className={`w-5 h-5 ${trend.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{trend.value}</div>
                  <p className="text-sm text-slate-600">{trend.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Próxima Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Novos Leads</span>
                    <span className="font-medium">{insights.predictions.nextWeek.newLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Conversões</span>
                    <span className="font-medium">{insights.predictions.nextWeek.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receita</span>
                    <span className="font-medium">R$ {insights.predictions.nextWeek.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Próximo Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Novos Leads</span>
                    <span className="font-medium">{insights.predictions.nextMonth.newLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Conversões</span>
                    <span className="font-medium">{insights.predictions.nextMonth.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receita</span>
                    <span className="font-medium">R$ {insights.predictions.nextMonth.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Selection */}
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle>Selecionar Empresa para Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {companies.slice(0, 20).map((company, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => analyzeCompany(company)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{company.razao_social}</p>
                          <p className="text-sm text-slate-600">{company.cnpj}</p>
                        </div>
                        <Badge variant="secondary">Score: {company.ai_score || "N/A"}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Individual Analysis */}
            {selectedCompany && (
              <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Análise: {selectedCompany.razao_social}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Score de Conversão</span>
                        <span className="text-2xl font-bold text-blue-600">{selectedCompany.analysis?.score || 0}</span>
                      </div>
                      <Progress value={selectedCompany.analysis?.score || 0} className="h-2" />
                    </div>

                    {/* Factors */}
                    <div>
                      <h4 className="font-medium mb-3">Fatores de Impacto</h4>
                      <div className="space-y-2">
                        {selectedCompany.analysis?.factors.map((factor: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{factor.name}</span>
                            <Badge variant={factor.positive ? "default" : "destructive"}>
                              {factor.impact > 0 ? "+" : ""}
                              {factor.impact}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-3">Recomendações</h4>
                      <ul className="space-y-1">
                        {selectedCompany.analysis?.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Predictions */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-slate-600">Melhor Horário</p>
                        <p className="font-medium">{selectedCompany.analysis?.bestContactTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Valor Estimado</p>
                        <p className="font-medium">R$ {selectedCompany.analysis?.estimatedValue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
