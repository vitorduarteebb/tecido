import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatarMoeda } from '../utils/format';

interface Produto {
  id: string;
  nome: string;
  codigo?: string;
  referencia?: string;
  imagemUrl?: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  observacao?: string;
}

interface Cliente {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone?: string;
  enderecoEntrega?: string;
}

interface Representante {
  nome: string;
  email?: string;
  telefone?: string;
}

interface PedidoPDFProps {
  numeroPedido: string;
  cliente: Cliente;
  produtos: Produto[];
  valorTotal: number;
  dataPedido: string;
  dataPrevisao: string;
  formaPagamento: string;
  condicaoPagamento: string;
  detalhePrazo?: string;
  representante?: Representante;
  observacoes?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  table: {
    display: 'table' as any,
    width: '100%',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
  },
  quantidadeCell: {
    flex: 0.5,
    textAlign: 'center',
  },
  valorCell: {
    flex: 0.8,
    textAlign: 'right',
  },
  total: {
    marginTop: 10,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

const PedidoPDF: React.FC<PedidoPDFProps> = ({
  numeroPedido,
  cliente,
  produtos,
  valorTotal,
  dataPedido,
  dataPrevisao,
  formaPagamento,
  condicaoPagamento,
  detalhePrazo,
  representante,
  observacoes
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Resumo do Pedido #{numeroPedido}</Text>
        <Text style={styles.subtitle}>Data do Pedido: {new Date(dataPedido).toLocaleDateString()}</Text>
        <Text style={styles.subtitle}>Previsão de Entrega: {new Date(dataPrevisao).toLocaleDateString()}</Text>
      </View>

      {/* Dados do Cliente */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Dados do Cliente</Text>
        <Text>{cliente.nome}</Text>
        <Text>CNPJ/CPF: {cliente.cnpj}</Text>
        <Text>Endereço: {cliente.endereco}</Text>
        {cliente.telefone && <Text>Telefone: {cliente.telefone}</Text>}
        {cliente.enderecoEntrega && <Text>Endereço de Entrega: {cliente.enderecoEntrega}</Text>}
      </View>

      {/* Dados do Representante */}
      {representante && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Representante</Text>
          <Text>{representante.nome}</Text>
          {representante.email && <Text>Email: {representante.email}</Text>}
          {representante.telefone && <Text>Telefone: {representante.telefone}</Text>}
        </View>
      )}

      {/* Forma e Condição de Pagamento */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Pagamento</Text>
        <Text>Forma: {formaPagamento}</Text>
        <Text>Condição: {condicaoPagamento}{detalhePrazo ? ` (${detalhePrazo})` : ''}</Text>
      </View>

      {/* Observações */}
      {observacoes && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Observações</Text>
          <Text>{observacoes}</Text>
        </View>
      )}

      {/* Tabela de Produtos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Produtos</Text>
        <View style={styles.table}>
          {/* Cabeçalho da Tabela */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Imagem</Text>
            <Text style={styles.tableCell}>Produto</Text>
            <Text style={styles.tableCell}>Código</Text>
            <Text style={styles.tableCell}>Referência</Text>
            <Text style={styles.quantidadeCell}>Qtd</Text>
            <Text style={styles.valorCell}>Valor Unit.</Text>
            <Text style={styles.valorCell}>Subtotal</Text>
            <Text style={styles.tableCell}>Obs.</Text>
          </View>

          {/* Linhas de Produtos */}
          {produtos.map((produto) => (
            <View key={produto.id} style={styles.tableRow}>
              <View style={styles.tableCell}>
                {produto.imagemUrl ? (
                  <Image src={produto.imagemUrl} style={{ width: 40, height: 40 }} />
                ) : (
                  <Text>-</Text>
                )}
              </View>
              <Text style={styles.tableCell}>{produto.nome}</Text>
              <Text style={styles.tableCell}>{produto.codigo || '-'}</Text>
              <Text style={styles.tableCell}>{produto.referencia || '-'}</Text>
              <Text style={styles.quantidadeCell}>{produto.quantidade}</Text>
              <Text style={styles.valorCell}>{formatarMoeda(produto.valorUnitario)}</Text>
              <Text style={styles.valorCell}>{formatarMoeda(produto.subtotal)}</Text>
              <Text style={styles.tableCell}>{produto.observacao || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <Text style={styles.total}>
          Valor Total: {formatarMoeda(valorTotal)}
        </Text>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text>Este documento é um resumo do pedido e não tem valor fiscal.</Text>
      </View>
    </Page>
  </Document>
);

export default PedidoPDF; 