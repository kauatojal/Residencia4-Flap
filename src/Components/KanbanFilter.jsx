import React, { useState } from "react";
import "./KanbanFilter.css";

function KanbanFilter({ onClose, onApply, members = [], currentUser = null }) {
    const [filterData, setFilterData] = useState({
        keyword: "",
        selectedMembers: [],
        cardStatus: "",
        deliveryDate: "",
        selectedLabels: []
    });

    const mockMembers = ["Membro 1", "Membro 2", "Membro 3"];
    const effectiveMembers = members.length ? members : mockMembers;
    const labels = ["Urgente", "Normal", "Baixa Prioridade"];

    const getTagColor = (tag) => {
        switch (tag) {
            case "Urgente":
                return "#ff6b6b";
            case "Normal":
                return "#ffa500";
            case "Baixa Prioridade":
                return "#4caf50";
            default:
                return "#fff";
        }
    };

    const toggleMember = (member) => {
        setFilterData(prev => ({
            ...prev,
            selectedMembers: prev.selectedMembers.includes(member)
                ? prev.selectedMembers.filter(m => m !== member)
                : [...prev.selectedMembers, member]
        }));
    };

    const toggleLabel = (label) => {
        setFilterData(prev => ({
            ...prev,
            selectedLabels: prev.selectedLabels.includes(label)
                ? prev.selectedLabels.filter(l => l !== label)
                : [...prev.selectedLabels, label]
        }));
    };

    const clearFilters = () => {
        setFilterData({
            keyword: "",
            selectedMembers: [],
            cardStatus: "",
            deliveryDate: "",
            selectedLabels: []
        });
    };

    const applyFilters = () => {
        onApply(filterData);
        onClose();
    };

    return (
        <div className="kanban-filter-overlay" onClick={onClose}>
            <div className="kanban-filter-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kanban-filter-content">
                    <div className="kanban-filter-header">
                        <h2>Filtrar Tarefas</h2>
                        <button className="kanban-filter-close" onClick={onClose}>
                            ✕
                        </button>
                    </div>

                    <div className="kanban-filter-form">
                        <div className="kanban-filter-row">
                            <div className="kanban-filter-field full">
                                <label>Palavra-chave</label>
                                <input
                                    type="text"
                                    placeholder="Insira uma palavra-chave..."
                                    value={filterData.keyword}
                                    onChange={(e) => setFilterData({ ...filterData, keyword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="kanban-filter-row">
                            <div className="kanban-filter-field full">
                                <label>Membros</label>
                                <div className="kanban-filter-members-list">
                                    {effectiveMembers.map((member) => (
                                        <div
                                            key={member}
                                            className={`kanban-filter-member ${filterData.selectedMembers.includes(member) ? "selected" : ""
                                                }`}
                                            onClick={() => toggleMember(member)}
                                        >
                                            <span className="member-avatar">👤</span>
                                            <div className="member-name">{member}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="kanban-filter-options">
                                    <label className="kanban-filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filterData.selectedMembers.includes("Sem membros")}
                                            onChange={() => toggleMember("Sem membros")}
                                        />
                                        Sem membros
                                    </label>
                                    <label className="kanban-filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filterData.selectedMembers.includes("Cartões atribuídos a mim")}
                                            onChange={() => toggleMember("Cartões atribuídos a mim")}
                                        />
                                        Cartões atribuídos a mim
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="kanban-filter-row">
                            <div className="kanban-filter-field full">
                                <label>Status do Card</label>
                                <div className="kanban-filter-radio-group">
                                    <label className="kanban-filter-radio">
                                        <input
                                            type="radio"
                                            name="cardStatus"
                                            checked={filterData.cardStatus === "concluido"}
                                            onChange={() => setFilterData({ ...filterData, cardStatus: "concluido" })}
                                        />
                                        <span className="radio-custom"></span>
                                        Marcado como concluído
                                    </label>
                                    <label className="kanban-filter-radio">
                                        <input
                                            type="radio"
                                            name="cardStatus"
                                            checked={filterData.cardStatus === "nao-concluido"}
                                            onChange={() => setFilterData({ ...filterData, cardStatus: "nao-concluido" })}
                                        />
                                        <span className="radio-custom"></span>
                                        Não marcado como concluído
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="kanban-filter-row">
                            <div className="kanban-filter-field full">
                                <label>Data de entrega</label>
                                <div className="kanban-filter-radio-group">
                                    {["Sem datas", "Em Atraso", "A ser entregue em um dia", "A ser entregue em uma semana", "A ser entregue em um mês"].map(option => (
                                        <label key={option} className="kanban-filter-radio">
                                            <input
                                                type="radio"
                                                name="deliveryDate"
                                                checked={filterData.deliveryDate === option}
                                                onChange={() => setFilterData({ ...filterData, deliveryDate: option })}
                                            />
                                            <span className="radio-custom"></span>
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="kanban-filter-row">
                            <div className="kanban-filter-field full">
                                <label>Etiquetas</label>
                                <div className="kanban-filter-labels">
                                    {labels.map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            className={`kanban-filter-label ${filterData.selectedLabels.includes(label) ? "selected" : ""
                                                }`}
                                            onClick={() => toggleLabel(label)}
                                            style={{
                                                backgroundColor: filterData.selectedLabels.includes(label) ? getTagColor(label) : "#f6f6f6",
                                                color: filterData.selectedLabels.includes(label) ? "#fff" : "#333"
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <label className="kanban-filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filterData.selectedLabels.includes("Sem etiquetas")}
                                        onChange={() => toggleLabel("Sem etiquetas")}
                                    />
                                    Sem etiquetas
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="kanban-filter-right-sidebar">
                    <div className="kanban-filter-actions">
                        <button
                            type="button"
                            className="kanban-filter-clear"
                            onClick={clearFilters}
                        >
                            Limpar Filtros
                        </button>

                        <div className="kanban-filter-buttons">
                            <button
                                type="button"
                                className="kanban-filter-cancel"
                                onClick={onClose}
                            >
                                Fechar
                            </button>
                            <button
                                type="button"
                                className="kanban-filter-apply"
                                onClick={applyFilters}
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default KanbanFilter;