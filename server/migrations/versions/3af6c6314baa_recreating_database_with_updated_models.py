"""Recreating database with updated models

Revision ID: 3af6c6314baa
Revises: 
Create Date: 2025-01-29 20:42:14.258936

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3af6c6314baa'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('cryptocurrencies',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('symbol', sa.String(length=10), nullable=False),
    sa.Column('market_price', sa.Numeric(precision=20, scale=8), nullable=False),
    sa.Column('market_cap', sa.Numeric(precision=20, scale=2), nullable=True),
    sa.Column('market_cap_change_24h', sa.Float(), nullable=True),
    sa.Column('logo_url', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('symbol')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=80), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('password_hash', sa.String(length=200), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('price_history',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cryptocurrency_id', sa.Integer(), nullable=False),
    sa.Column('price', sa.Numeric(precision=20, scale=8), nullable=False),
    sa.Column('recorded_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['cryptocurrency_id'], ['cryptocurrencies.id'], name=op.f('fk_price_history_cryptocurrency_id_cryptocurrencies')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('trending_cryptocurrencies',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cryptocurrency_id', sa.Integer(), nullable=False),
    sa.Column('rank', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['cryptocurrency_id'], ['cryptocurrencies.id'], name=op.f('fk_trending_cryptocurrencies_cryptocurrency_id_cryptocurrencies')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('user_cryptocurrencies',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('cryptocurrency_id', sa.Integer(), nullable=False),
    sa.Column('alert_price', sa.Numeric(precision=20, scale=8), nullable=False),
    sa.ForeignKeyConstraint(['cryptocurrency_id'], ['cryptocurrencies.id'], name=op.f('fk_user_cryptocurrencies_cryptocurrency_id_cryptocurrencies')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_cryptocurrencies_user_id_users')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_cryptocurrencies')
    op.drop_table('trending_cryptocurrencies')
    op.drop_table('price_history')
    op.drop_table('users')
    op.drop_table('cryptocurrencies')
    # ### end Alembic commands ###
