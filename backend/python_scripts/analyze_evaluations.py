import sys
import json

def analyze_data(evaluations):
    if not evaluations:
        return {"summary": "Nenhuma avaliação para analisar.", "details": []}

    total_evaluations = len(evaluations)
    total_infra = sum(e.get('nota_infraestrutura', 0) for e in evaluations)
    total_material = sum(e.get('nota_material_didatico', 0) for e in evaluations)

    avg_infra = total_infra / total_evaluations if total_evaluations > 0 else 0
    avg_material = total_material / total_evaluations if total_evaluations > 0 else 0

    # Exemplo de agregação por instituição/curso
    aggregated_data = {}
    for eval_item in evaluations:
        instituicao = eval_item.get('instituicao_nome', 'Desconhecida')
        curso = eval_item.get('curso_nome', 'Desconhecido')
        key = f"{instituicao}-{curso}"

        if key not in aggregated_data:
            aggregated_data[key] = {
                "instituicao": instituicao,
                "curso": curso,
                "count": 0,
                "sum_infra": 0,
                "sum_material": 0,
                "obs_infra": [],
                "obs_material": []
            }
        aggregated_data[key]["count"] += 1
        aggregated_data[key]["sum_infra"] += eval_item.get('nota_infraestrutura', 0)
        aggregated_data[key]["sum_material"] += eval_item.get('nota_material_didatico', 0)
        if eval_item.get('obs_infraestrutura'):
            aggregated_data[key]["obs_infra"].append(eval_item['obs_infraestrutura'])
        if eval_item.get('obs_material_didatico'):
            aggregated_data[key]["obs_material"].append(eval_item['obs_material_didatico'])

    detailed_reports = []
    for key, data in aggregated_data.items():
        avg_i = data["sum_infra"] / data["count"] if data["count"] > 0 else 0
        avg_m = data["sum_material"] / data["count"] if data["count"] > 0 else 0
        detailed_reports.append({
            "instituicao": data["instituicao"],
            "curso": data["curso"],
            "total_avaliacoes": data["count"],
            "media_infraestrutura": round(avg_i, 2),
            "media_material_didatico": round(avg_m, 2),
            "observacoes_infraestrutura": data["obs_infra"],
            "observacoes_material_didatico": data["obs_material"]
        })

    overall_summary = {
        "total_avaliacoes_geral": total_evaluations,
        "media_infraestrutura_geral": round(avg_infra, 2),
        "media_material_didatico_geral": round(avg_material, 2)
    }

    return {"overall_summary": overall_summary, "detailed_reports": detailed_reports}

if __name__ == "__main__":
    input_data = json.load(sys.stdin)
    result = analyze_data(input_data)
    json.dump(result, sys.stdout, indent=2)
